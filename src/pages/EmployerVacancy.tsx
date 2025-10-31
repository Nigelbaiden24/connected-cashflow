import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const vacancySchema = z.object({
  companyName: z.string().min(2, "Company name is required").max(200),
  contactName: z.string().min(2, "Contact name is required").max(100),
  contactEmail: z.string().email("Invalid email address").max(255),
  contactPhone: z.string().min(10, "Phone number is required").max(20),
  jobTitle: z.string().min(2, "Job title is required").max(200),
  jobSector: z.string().min(2, "Job sector is required"),
  jobLocation: z.string().min(2, "Job location is required").max(200),
  jobType: z.string().min(2, "Job type is required"),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters").max(5000),
  startDate: z.date().optional(),
  applicationDeadline: z.date().optional(),
  numberOfPositions: z.coerce.number().min(1).default(1),
  remoteWork: z.boolean().default(false),
  visaSponsorship: z.boolean().default(false),
});

type VacancyFormValues = z.infer<typeof vacancySchema>;

export default function EmployerVacancy() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      numberOfPositions: 1,
      remoteWork: false,
      visaSponsorship: false,
    },
  });

  const onSubmit = async (values: VacancyFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("vacancies").insert({
        user_id: user?.id,
        company_name: values.companyName,
        contact_name: values.contactName,
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone,
        job_title: values.jobTitle,
        job_sector: values.jobSector,
        job_location: values.jobLocation,
        job_type: values.jobType,
        salary_min: values.salaryMin,
        salary_max: values.salaryMax,
        job_description: values.jobDescription,
        start_date: values.startDate ? format(values.startDate, "yyyy-MM-dd") : null,
        application_deadline: values.applicationDeadline ? format(values.applicationDeadline, "yyyy-MM-dd") : null,
        number_of_positions: values.numberOfPositions,
        remote_work: values.remoteWork,
        visa_sponsorship: values.visaSponsorship,
      });

      if (error) throw error;

      toast.success("Vacancy posted successfully! We'll review and publish it shortly.");
      navigate("/recruitment");
    } catch (error: any) {
      console.error("Error submitting vacancy:", error);
      toast.error(error.message || "Failed to submit vacancy. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl">Post a Vacancy</CardTitle>
            <CardDescription>
              Connect with top talent by posting your job opening. Fill in the details below to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC Corporation Ltd" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="hr@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Contact Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+44 20 7946 0958" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Senior Financial Analyst" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobSector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sector *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sector" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="temporary">Temporary</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobLocation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input placeholder="London, UK" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary Min (£)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary Max (£)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="70000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numberOfPositions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Positions *</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expected Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="applicationDeadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Application Deadline</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-6 pt-4">
                    <FormField
                      control={form.control}
                      name="remoteWork"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Remote Work Available</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="visaSponsorship"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Visa Sponsorship Available</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job Description</h3>
                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Job Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of the role, responsibilities, requirements, and what makes this opportunity unique..."
                            className="min-h-64"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include key responsibilities, required qualifications, preferred skills, and benefits
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Post Vacancy"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
