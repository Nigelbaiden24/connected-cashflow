export interface DocumentTemplate {
  id: string;
  name: string;
  category: 'contract' | 'invoice' | 'letter' | 'agreement' | 'proposal';
  description: string;
  fields: TemplateField[];
  sections: TemplateSection[];
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'checkbox' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string | boolean | number;
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  editable: boolean;
  conditional?: {
    fieldId: string;
    value: boolean;
  };
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'service-agreement',
    name: 'Service Agreement',
    category: 'contract',
    description: 'Standard service agreement for financial advisory services',
    fields: [
      { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Enter client full name', required: true },
      { id: 'clientCompany', label: 'Client Company', type: 'text', placeholder: 'Company name (if applicable)' },
      { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'Full address', required: true },
      { id: 'serviceType', label: 'Service Type', type: 'select', options: ['Financial Advisory', 'Investment Management', 'Wealth Planning', 'Tax Planning', 'Estate Planning'], required: true },
      { id: 'startDate', label: 'Start Date', type: 'date', required: true },
      { id: 'endDate', label: 'End Date', type: 'date' },
      { id: 'feeAmount', label: 'Fee Amount (£)', type: 'number', placeholder: '0.00', required: true },
      { id: 'feeStructure', label: 'Fee Structure', type: 'select', options: ['Fixed Annual Fee', 'Percentage of AUM', 'Hourly Rate', 'Project-Based'], required: true },
      { id: 'includeConfidentiality', label: 'Include Confidentiality Clause', type: 'checkbox', defaultValue: true },
      { id: 'includeTermination', label: 'Include Termination Clause', type: 'checkbox', defaultValue: true },
    ],
    sections: [
      {
        id: 'intro',
        title: 'Agreement Introduction',
        content: 'This Service Agreement ("Agreement") is entered into as of {startDate} between FlowPulse.io ("Advisor") and {clientName} {clientCompany} ("Client").',
        editable: true,
      },
      {
        id: 'services',
        title: 'Services',
        content: 'The Advisor agrees to provide {serviceType} services to the Client. These services include but are not limited to: financial analysis, investment recommendations, portfolio monitoring, and regular performance reporting.',
        editable: true,
      },
      {
        id: 'fees',
        title: 'Fees and Payment',
        content: 'The Client agrees to pay the Advisor £{feeAmount} under a {feeStructure} arrangement. Payment is due within 30 days of invoice date. Late payments may incur interest at a rate of 2% per month.',
        editable: true,
      },
      {
        id: 'confidentiality',
        title: 'Confidentiality',
        content: 'Both parties agree to maintain strict confidentiality of all information exchanged during the course of this agreement. This obligation shall survive the termination of this Agreement.',
        editable: true,
        conditional: { fieldId: 'includeConfidentiality', value: true },
      },
      {
        id: 'termination',
        title: 'Termination',
        content: 'Either party may terminate this Agreement with 30 days written notice. Upon termination, the Client shall pay any outstanding fees for services rendered.',
        editable: true,
        conditional: { fieldId: 'includeTermination', value: true },
      },
    ],
  },
  {
    id: 'invoice',
    name: 'Professional Invoice',
    category: 'invoice',
    description: 'Detailed invoice for advisory services rendered',
    fields: [
      { id: 'invoiceNumber', label: 'Invoice Number', type: 'text', placeholder: 'INV-001', required: true },
      { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Client full name', required: true },
      { id: 'clientCompany', label: 'Client Company', type: 'text', placeholder: 'Company name' },
      { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'Billing address', required: true },
      { id: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
      { id: 'dueDate', label: 'Due Date', type: 'date', required: true },
      { id: 'serviceDescription', label: 'Service Description', type: 'textarea', placeholder: 'Description of services provided', required: true },
      { id: 'amount', label: 'Amount (£)', type: 'number', placeholder: '0.00', required: true },
      { id: 'vatRate', label: 'VAT Rate (%)', type: 'number', placeholder: '20', defaultValue: 20 },
      { id: 'includeVAT', label: 'Include VAT', type: 'checkbox', defaultValue: true },
      { id: 'paymentReference', label: 'Payment Reference', type: 'text', placeholder: 'Reference for payment' },
    ],
    sections: [
      {
        id: 'header',
        title: 'Invoice Details',
        content: 'Invoice #{invoiceNumber}\nDate: {invoiceDate}\nDue Date: {dueDate}',
        editable: false,
      },
      {
        id: 'billTo',
        title: 'Bill To',
        content: '{clientName}\n{clientCompany}\n{clientAddress}',
        editable: false,
      },
      {
        id: 'services',
        title: 'Services Rendered',
        content: '{serviceDescription}',
        editable: true,
      },
      {
        id: 'payment',
        title: 'Payment Details',
        content: 'Please make payment to:\nBank: Barclays Bank\nSort Code: 20-00-00\nAccount: 12345678\nReference: {paymentReference}',
        editable: true,
      },
    ],
  },
  {
    id: 'engagement-letter',
    name: 'Engagement Letter',
    category: 'letter',
    description: 'Formal engagement letter for new clients',
    fields: [
      { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Client full name', required: true },
      { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'Full address', required: true },
      { id: 'meetingDate', label: 'Initial Meeting Date', type: 'date' },
      { id: 'serviceScope', label: 'Scope of Services', type: 'textarea', placeholder: 'Describe the scope of services', required: true },
      { id: 'estimatedFee', label: 'Estimated Fee (£)', type: 'number', placeholder: '0.00' },
      { id: 'includeRiskWarning', label: 'Include Risk Warning', type: 'checkbox', defaultValue: true },
      { id: 'includeDataProtection', label: 'Include Data Protection Notice', type: 'checkbox', defaultValue: true },
    ],
    sections: [
      {
        id: 'greeting',
        title: 'Greeting',
        content: 'Dear {clientName},\n\nThank you for choosing FlowPulse.io as your financial advisor. We are delighted to confirm our engagement and outline the terms of our professional relationship.',
        editable: true,
      },
      {
        id: 'scope',
        title: 'Scope of Engagement',
        content: '{serviceScope}',
        editable: true,
      },
      {
        id: 'fees',
        title: 'Our Fees',
        content: 'Our estimated fee for the services described above is £{estimatedFee}. This estimate may be revised based on the actual scope of work required. We will notify you of any significant changes before proceeding.',
        editable: true,
      },
      {
        id: 'riskWarning',
        title: 'Risk Warning',
        content: 'The value of investments and the income from them can go down as well as up. Past performance is not a reliable indicator of future results. You may not get back the amount originally invested.',
        editable: true,
        conditional: { fieldId: 'includeRiskWarning', value: true },
      },
      {
        id: 'dataProtection',
        title: 'Data Protection',
        content: 'We are committed to protecting your personal data in accordance with the UK GDPR and Data Protection Act 2018. Your information will be used solely for the purpose of providing our services and will not be shared with third parties without your consent.',
        editable: true,
        conditional: { fieldId: 'includeDataProtection', value: true },
      },
    ],
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    category: 'agreement',
    description: 'Confidentiality agreement for sensitive discussions',
    fields: [
      { id: 'partyName', label: 'Second Party Name', type: 'text', placeholder: 'Full name or company', required: true },
      { id: 'partyAddress', label: 'Second Party Address', type: 'textarea', placeholder: 'Full address', required: true },
      { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
      { id: 'confidentialityPeriod', label: 'Confidentiality Period (Years)', type: 'number', placeholder: '2', defaultValue: 2 },
      { id: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', placeholder: 'Describe the purpose', required: true },
      { id: 'isMutual', label: 'Mutual NDA (Both Parties)', type: 'checkbox', defaultValue: false },
    ],
    sections: [
      {
        id: 'parties',
        title: 'Parties',
        content: 'This Non-Disclosure Agreement is entered into as of {effectiveDate} between FlowPulse.io ("Disclosing Party") and {partyName} ("Receiving Party").',
        editable: true,
      },
      {
        id: 'purpose',
        title: 'Purpose',
        content: 'The parties wish to explore a potential business relationship in connection with: {purpose}. In connection with this purpose, the Disclosing Party may share certain confidential information with the Receiving Party.',
        editable: true,
      },
      {
        id: 'obligations',
        title: 'Confidentiality Obligations',
        content: 'The Receiving Party agrees to:\n• Hold all Confidential Information in strict confidence\n• Not disclose Confidential Information to any third party\n• Use Confidential Information only for the stated purpose\n• Protect Confidential Information with the same degree of care used to protect its own confidential information',
        editable: true,
      },
      {
        id: 'term',
        title: 'Term',
        content: 'This Agreement shall remain in effect for a period of {confidentialityPeriod} years from the Effective Date. The obligations of confidentiality shall survive the termination of this Agreement.',
        editable: true,
      },
    ],
  },
  {
    id: 'fee-proposal',
    name: 'Fee Proposal',
    category: 'proposal',
    description: 'Detailed fee proposal for prospective clients',
    fields: [
      { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Prospective client name', required: true },
      { id: 'clientCompany', label: 'Company Name', type: 'text', placeholder: 'Company (if applicable)' },
      { id: 'proposalDate', label: 'Proposal Date', type: 'date', required: true },
      { id: 'validUntil', label: 'Valid Until', type: 'date', required: true },
      { id: 'portfolioSize', label: 'Estimated Portfolio Size (£)', type: 'number', placeholder: '0' },
      { id: 'annualFee', label: 'Annual Fee (£)', type: 'number', placeholder: '0.00', required: true },
      { id: 'feePercentage', label: 'Fee as % of AUM', type: 'number', placeholder: '0.00' },
      { id: 'includeOnboarding', label: 'Include Onboarding Fee', type: 'checkbox', defaultValue: false },
      { id: 'onboardingFee', label: 'Onboarding Fee (£)', type: 'number', placeholder: '0.00' },
      { id: 'servicesIncluded', label: 'Services Included', type: 'textarea', placeholder: 'List all services included', required: true },
    ],
    sections: [
      {
        id: 'intro',
        title: 'Introduction',
        content: 'Dear {clientName},\n\nThank you for considering FlowPulse.io for your financial planning needs. We are pleased to present this fee proposal for your review.',
        editable: true,
      },
      {
        id: 'services',
        title: 'Services Included',
        content: '{servicesIncluded}',
        editable: true,
      },
      {
        id: 'fees',
        title: 'Fee Structure',
        content: 'Annual Advisory Fee: £{annualFee}\nAs a percentage of portfolio: {feePercentage}%\n\nThis fee covers all services listed above and includes unlimited consultations throughout the year.',
        editable: true,
      },
      {
        id: 'onboarding',
        title: 'Onboarding',
        content: 'One-time Onboarding Fee: £{onboardingFee}\n\nThis covers initial fact-finding, risk assessment, and the creation of your personalised financial plan.',
        editable: true,
        conditional: { fieldId: 'includeOnboarding', value: true },
      },
      {
        id: 'validity',
        title: 'Proposal Validity',
        content: 'This proposal is valid until {validUntil}. Please contact us if you have any questions or would like to proceed.',
        editable: true,
      },
    ],
  },
];

export const getCategoryIcon = (category: DocumentTemplate['category']) => {
  switch (category) {
    case 'contract': return '📝';
    case 'invoice': return '🧾';
    case 'letter': return '✉️';
    case 'agreement': return '🤝';
    case 'proposal': return '📋';
    default: return '📄';
  }
};

export const getCategoryColor = (category: DocumentTemplate['category']) => {
  switch (category) {
    case 'contract': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'invoice': return 'bg-green-100 text-green-800 border-green-200';
    case 'letter': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'agreement': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'proposal': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};
