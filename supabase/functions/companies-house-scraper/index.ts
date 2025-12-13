const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanyData {
  company_name: string;
  company_number: string;
  company_status: string;
  sic_codes: string[];
  incorporation_date: string | null;
  registered_address: string;
}

interface OfficerData {
  full_name: string;
  officer_role: string;
  date_of_birth_month: number | null;
  date_of_birth_year: number | null;
  nationality: string | null;
  correspondence_address: string | null;
  appointed_date: string | null;
  resigned_date: string | null;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = () => {
  const base = 2000; // 2 seconds base
  const variance = Math.random() * 1000 - 500; // ±500ms
  return delay(base + variance);
};

async function fetchWithRetry(url: string, retries = 1): Promise<Response | null> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5',
      },
    });

    if (response.status !== 200) {
      console.log(`HTTP ${response.status} for ${url}`);
      if (retries > 0) {
        console.log('Retrying after 10s...');
        await delay(10000);
        return fetchWithRetry(url, retries - 1);
      }
      return null;
    }

    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    if (retries > 0) {
      console.log('Retrying after 10s...');
      await delay(10000);
      return fetchWithRetry(url, retries - 1);
    }
    return null;
  }
}

function parseCompanySearchResults(html: string): { companies: Partial<CompanyData>[]; hasNextPage: boolean } {
  const companies: Partial<CompanyData>[] = [];
  
  // Extract company links and basic info from search results
  const companyPattern = /<a class="govuk-link" href="\/company\/(\d+)"[^>]*>([^<]+)<\/a>/gi;
  const statusPattern = /<dd class="column-half">\s*(Active|Dissolved|Liquidation|[^<]+)\s*<\/dd>/gi;
  
  let match;
  const companyNumbers: string[] = [];
  const companyNames: string[] = [];
  
  while ((match = companyPattern.exec(html)) !== null) {
    if (!companyNumbers.includes(match[1])) {
      companyNumbers.push(match[1]);
      companyNames.push(match[2].trim());
    }
  }
  
  for (let i = 0; i < companyNumbers.length; i++) {
    companies.push({
      company_number: companyNumbers[i],
      company_name: companyNames[i],
    });
  }
  
  // Check for next page
  const hasNextPage = html.includes('Next page') || html.includes('page=');
  
  return { companies, hasNextPage };
}

function parseCompanyDetails(html: string, companyNumber: string): CompanyData | null {
  try {
    // Extract company name
    const nameMatch = html.match(/<h1 class="heading-xlarge"[^>]*>([^<]+)<\/h1>/i) 
      || html.match(/<p class="heading-xlarge" id="company-name">([^<]+)<\/p>/i)
      || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const companyName = nameMatch ? nameMatch[1].trim() : 'Unknown';

    // Extract status
    const statusMatch = html.match(/Company status[^<]*<\/dt>\s*<dd[^>]*>\s*<strong[^>]*>([^<]+)<\/strong>/i)
      || html.match(/Status[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i);
    const status = statusMatch ? statusMatch[1].trim() : 'Unknown';

    // Extract SIC codes
    const sicCodes: string[] = [];
    const sicPattern = /(\d{5})\s*-\s*([^<]+)/g;
    let sicMatch;
    while ((sicMatch = sicPattern.exec(html)) !== null) {
      sicCodes.push(sicMatch[1]);
    }

    // Extract incorporation date
    const incDateMatch = html.match(/Incorporated on[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i)
      || html.match(/(\d{1,2}\s+\w+\s+\d{4})/);
    let incorporationDate: string | null = null;
    if (incDateMatch) {
      const dateStr = incDateMatch[1].trim();
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        incorporationDate = parsed.toISOString().split('T')[0];
      }
    }

    // Extract registered address
    const addressMatch = html.match(/Registered office address[^<]*<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
    let address = '';
    if (addressMatch) {
      address = addressMatch[1].replace(/<[^>]+>/g, ', ').replace(/\s+/g, ' ').trim();
      address = address.replace(/^,\s*/, '').replace(/,\s*$/, '');
    }

    return {
      company_name: companyName,
      company_number: companyNumber,
      company_status: status,
      sic_codes: sicCodes,
      incorporation_date: incorporationDate,
      registered_address: address,
    };
  } catch (error) {
    console.error('Error parsing company details:', error);
    return null;
  }
}

function parseOfficers(html: string): { officers: OfficerData[]; hasNextPage: boolean } {
  const officers: OfficerData[] = [];
  
  try {
    // Parse officer appointments
    const appointmentPattern = /<div class="appointment-\d+"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="appointment-|<nav|<\/main)/gi;
    let match;
    
    while ((match = appointmentPattern.exec(html)) !== null) {
      const block = match[1];
      
      // Extract name
      const nameMatch = block.match(/<a[^>]*>([^<]+)<\/a>/i) || block.match(/<h2[^>]*>([^<]+)<\/h2>/i);
      if (!nameMatch) continue;
      
      const fullName = nameMatch[1].trim().replace(/\s+/g, ' ');
      
      // Extract role
      const roleMatch = block.match(/Role[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i)
        || block.match(/(Director|Secretary|Member|Person with significant control|PSC)/i);
      const role = roleMatch ? roleMatch[1].trim() : 'Director';
      
      // Extract DOB
      let dobMonth: number | null = null;
      let dobYear: number | null = null;
      const dobMatch = block.match(/Date of birth[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i)
        || block.match(/Born[^<]*(\w+\s+\d{4})/i);
      if (dobMatch) {
        const dobStr = dobMatch[1].trim();
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december'];
        const monthMatch = dobStr.toLowerCase().match(new RegExp(`(${monthNames.join('|')})`));
        const yearMatch = dobStr.match(/(\d{4})/);
        
        if (monthMatch) {
          dobMonth = monthNames.indexOf(monthMatch[1]) + 1;
        }
        if (yearMatch) {
          dobYear = parseInt(yearMatch[1]);
        }
      }
      
      // Extract nationality
      const nationalityMatch = block.match(/Nationality[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i);
      const nationality = nationalityMatch ? nationalityMatch[1].trim() : null;
      
      // Extract address
      const addressMatch = block.match(/Correspondence address[^<]*<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i)
        || block.match(/Address[^<]*<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
      let address: string | null = null;
      if (addressMatch) {
        address = addressMatch[1].replace(/<[^>]+>/g, ', ').replace(/\s+/g, ' ').trim();
        address = address.replace(/^,\s*/, '').replace(/,\s*$/, '');
      }
      
      // Extract appointed date
      const appointedMatch = block.match(/Appointed[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i);
      let appointedDate: string | null = null;
      if (appointedMatch) {
        const parsed = new Date(appointedMatch[1].trim());
        if (!isNaN(parsed.getTime())) {
          appointedDate = parsed.toISOString().split('T')[0];
        }
      }
      
      // Extract resigned date
      const resignedMatch = block.match(/Resigned[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i);
      let resignedDate: string | null = null;
      if (resignedMatch) {
        const parsed = new Date(resignedMatch[1].trim());
        if (!isNaN(parsed.getTime())) {
          resignedDate = parsed.toISOString().split('T')[0];
        }
      }
      
      officers.push({
        full_name: fullName,
        officer_role: role,
        date_of_birth_month: dobMonth,
        date_of_birth_year: dobYear,
        nationality,
        correspondence_address: address,
        appointed_date: appointedDate,
        resigned_date: resignedDate,
      });
    }
    
    // Check for pagination
    const hasNextPage = html.includes('Next') && html.includes('page=');
    
    return { officers, hasNextPage };
  } catch (error) {
    console.error('Error parsing officers:', error);
    return { officers: [], hasNextPage: false };
  }
}

async function scrapeCompany(companyNumber: string): Promise<{ company: CompanyData | null; officers: OfficerData[] }> {
  const baseUrl = 'https://find-and-update.company-information.service.gov.uk';
  
  // Fetch company details
  const companyUrl = `${baseUrl}/company/${companyNumber}`;
  const companyResponse = await fetchWithRetry(companyUrl);
  
  if (!companyResponse) {
    return { company: null, officers: [] };
  }
  
  const companyHtml = await companyResponse.text();
  const company = parseCompanyDetails(companyHtml, companyNumber);
  
  if (!company) {
    return { company: null, officers: [] };
  }
  
  await randomDelay();
  
  // Fetch officers with pagination
  const allOfficers: OfficerData[] = [];
  let page = 1;
  let hasMore = true;
  const maxPages = 10; // Limit to prevent infinite loops
  
  while (hasMore && page <= maxPages) {
    const officersUrl = page === 1 
      ? `${baseUrl}/company/${companyNumber}/officers`
      : `${baseUrl}/company/${companyNumber}/officers?page=${page}`;
    
    const officersResponse = await fetchWithRetry(officersUrl);
    
    if (!officersResponse) {
      break;
    }
    
    const officersHtml = await officersResponse.text();
    const { officers, hasNextPage } = parseOfficers(officersHtml);
    
    // Deduplicate officers
    for (const officer of officers) {
      const exists = allOfficers.some(o => o.full_name === officer.full_name);
      if (!exists) {
        allOfficers.push(officer);
      }
    }
    
    hasMore = hasNextPage && officers.length > 0;
    page++;
    
    if (hasMore) {
      await randomDelay();
    }
  }
  
  return { company, officers: allOfficers };
}

async function searchCompanies(query: string, searchType: string, maxPages = 5): Promise<string[]> {
  const baseUrl = 'https://find-and-update.company-information.service.gov.uk';
  const companyNumbers: string[] = [];
  
  let page = 1;
  let hasMore = true;
  
  while (hasMore && page <= maxPages) {
    const searchUrl = page === 1
      ? `${baseUrl}/search/companies?q=${encodeURIComponent(query)}`
      : `${baseUrl}/search/companies?q=${encodeURIComponent(query)}&page=${page}`;
    
    const response = await fetchWithRetry(searchUrl);
    
    if (!response) {
      break;
    }
    
    const html = await response.text();
    const { companies, hasNextPage } = parseCompanySearchResults(html);
    
    for (const company of companies) {
      if (company.company_number && !companyNumbers.includes(company.company_number)) {
        companyNumbers.push(company.company_number);
      }
    }
    
    hasMore = hasNextPage && companies.length > 0;
    page++;
    
    if (hasMore) {
      await randomDelay();
    }
  }
  
  return companyNumbers;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, searchType, companyNumber, maxPages } = await req.json();
    
    console.log(`Companies House Scraper - Action: ${action}, Query: ${query || companyNumber}`);

    if (action === 'search') {
      // Search for companies and return list
      const companyNumbers = await searchCompanies(query, searchType, maxPages || 5);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          companyNumbers,
          count: companyNumbers.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'scrape_company') {
      // Scrape a single company's details and officers
      const { company, officers } = await scrapeCompany(companyNumber);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          company,
          officers,
          officerCount: officers.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'full_scrape') {
      // Full scrape: search + get details for each company
      const companyNumbers = await searchCompanies(query, searchType, maxPages || 3);
      
      const results: { company: CompanyData; officers: OfficerData[] }[] = [];
      
      for (const cn of companyNumbers.slice(0, 10)) { // Limit to 10 companies per request
        await randomDelay();
        const { company, officers } = await scrapeCompany(cn);
        
        if (company) {
          results.push({ company, officers });
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          results,
          totalCompanies: results.length,
          totalOfficers: results.reduce((sum, r) => sum + r.officers.length, 0)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scraper error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
