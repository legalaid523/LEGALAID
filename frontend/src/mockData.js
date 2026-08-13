/** Hardcoded demo data — tenant deposit-withheld scenario */

export const INITIAL_GREETING = {
  text: `Welcome to LegalAId. I help first-generation litigants in India understand their rights, gather the facts of their case, and prepare formal documents — all in plain language.

Tell me about your situation: what happened, when it happened, and who is involved. I will guide you step by step.`,
  showDisclaimer: true,
};

export const DOMAIN_MOCK_DATA = {
  tenant: {
    followUpQuestions: [
      {
        id: 'vacate_date',
        text: `This sounds like a tenant dispute regarding a withheld security deposit. To understand your timeline, when did you vacate the premises?`,
        quickReplies: ['Within the last month', '1–3 months ago', 'More than 3 months ago'],
      },
      {
        id: 'deposit_amount',
        text: `Thank you. Approximately how much was your security deposit?`,
        quickReplies: ['Under ₹25,000', '₹25,000 – ₹50,000', 'Over ₹50,000'],
      },
      {
        id: 'deduction_notice',
        text: `Did your landlord provide a written, itemised list of deductions from your deposit?`,
        quickReplies: ['Yes', 'No', 'Not sure'],
      },
    ],
    caseSummary: `Based on what you have shared:
• Domain: Tenant Dispute — Security Deposit Withheld
• Issue: Landlord failed to refund deposit upon vacating
• Deduction Notice: No itemised list provided

I have prepared missing evidence recommendations and cited applicable tenancy rights below.`,
    confidenceFlags: [
      {
        field: 'Lease Agreement',
        message: 'A signed rent agreement showing deposit details is key evidence.',
      },
      {
        field: 'Payment Receipt',
        message: 'Bank transfer records or UPI transactions proving deposit payment.',
      },
      {
        field: 'Written Communications',
        message: 'WhatsApp messages or emails asking for deposit return.',
      },
    ],
    rightsData: {
      issue: 'Your Rights — Tenant Security Deposit',
      summary:
        'Under Tenancy Acts, landlords must refund security deposits within 30 days of vacating. Unilateral deductions without itemised repair bills are illegal.',
      sections: [
        {
          act: 'Model Tenancy Act / State Tenancy Act',
          section: 'Section 11',
          title: 'Refund of Security Deposit',
          text_summary:
            'Security deposit must be refunded after due deduction of valid liabilities within one month. The landlord must furnish an itemised bill of deductions.',
          source_url: 'https://indiankanoon.org/doc/182653321/',
        },
      ],
      notes: 'State specific rules may vary slightly. Keep written records of all communication.',
    },
    pdfResult: {
      documentTitle: 'Notice of Demand — Return of Security Deposit',
      documentType: 'notice',
      botMessage: 'Your legal Notice of Demand for deposit return is ready.',
    },
  },
  labor: {
    followUpQuestions: [
      {
        id: 'unpaid_duration',
        text: `This relates to a labor and employment dispute. How long has your employer withheld your wages/salary?`,
        quickReplies: ['1 Month', '2–3 Months', 'More than 3 Months'],
      },
      {
        id: 'employment_proof',
        text: `Do you have an appointment letter, ID card, or bank statements showing previous salary credits?`,
        quickReplies: ['Yes, I have proof', 'Only bank transfers', 'No formal document'],
      },
      {
        id: 'termination_status',
        text: `Have you been formally terminated, or are you still working with unpaid wages?`,
        quickReplies: ['Formally terminated', 'Still working', 'Resigned due to non-payment'],
      },
    ],
    caseSummary: `Based on what you have shared:
• Domain: Labor Issue — Unpaid Salary & Wages
• Issue: Employer failure to disburse wages within prescribed statutory timelines
• Status: Employment documentation available

Below are the missing evidence items and labor rights sections applicable to your case.`,
    confidenceFlags: [
      {
        field: 'Appointment Letter / Contract',
        message: 'Document stating agreed monthly wage and employment terms.',
      },
      {
        field: 'Bank Statement / Pay Slips',
        message: 'Bank records showing historical salary deposits and recent missed months.',
      },
      {
        field: 'Attendance & Communication Records',
        message: 'Emails, roster sheets, or messages showing hours worked.',
      },
    ],
    rightsData: {
      issue: 'Your Rights — Payment of Wages Act',
      summary:
        'Under the Payment of Wages Act, 1936 and Code on Wages, wages must be paid before the 7th or 10th day of every month. Delayed wages entitle employees to claim interest and compensation.',
      sections: [
        {
          act: 'Payment of Wages Act, 1936',
          section: 'Section 15',
          title: 'Claims arising out of deductions from wages',
          text_summary:
            'Employees can file claims before the Labor Authority for delayed or unpaid wages, seeking up to 10 times the amount as compensation.',
          source_url: 'https://indiankanoon.org/doc/1715017/',
        },
        {
          act: 'Industrial Disputes Act, 1947',
          section: 'Section 33C',
          title: 'Recovery of money due from an employer',
          text_summary:
            'Enables workmen to recover legitimate dues owed by an employer through the Labor Court.',
          source_url: 'https://indiankanoon.org/',
        },
      ],
      notes: 'Labor claims can be submitted to the Labor Commissioner or through formal demand notices.',
    },
    pdfResult: {
      documentTitle: 'Legal Notice of Demand — Unpaid Salary & Wages',
      documentType: 'notice',
      botMessage: 'Your formal Notice of Demand for unpaid salary is ready.',
    },
  },
  consumer: {
    followUpQuestions: [
      {
        id: 'product_service',
        text: `This appears to be a consumer protection issue. Did this involve a defective product, or a deficient service?`,
        quickReplies: ['Defective Product', 'Deficient Service', 'E-commerce Fraud / Delivery Issue'],
      },
      {
        id: 'purchase_proof',
        text: `Do you have the tax invoice, order confirmation, or payment receipt?`,
        quickReplies: ['Yes, original invoice', 'Digital receipt/UPI text', 'No receipt'],
      },
      {
        id: 'seller_response',
        text: `Did you send a formal email or complaint to the customer support team?`,
        quickReplies: ['Yes, but rejected', 'Sent, no response', 'Not yet'],
      },
    ],
    caseSummary: `Based on what you have shared:
• Domain: Consumer Dispute — Product/Service Deficiency
• Issue: Seller failure to provide agreed product quality or refund
• Documentation: Purchase proof available

Here is how you can strengthen your claim under the Consumer Protection Act.`,
    confidenceFlags: [
      {
        field: 'Tax Invoice / Bill',
        message: 'Bill showing date, price paid, seller name, and warranty terms.',
      },
      {
        field: 'Photos / Videos of Defect',
        message: 'Clear visual proof showing product fault or service gap.',
      },
      {
        field: 'Support Emails / Ticket IDs',
        message: 'Log of complaint numbers and customer care replies.',
      },
    ],
    rightsData: {
      issue: 'Your Rights — Consumer Protection Act, 2019',
      summary:
        'Consumers have the right to be protected against unfair trade practices and receive full refund, replacement, or compensation for defective goods and deficient services.',
      sections: [
        {
          act: 'Consumer Protection Act, 2019',
          section: 'Section 2(11)',
          title: 'Deficiency of Service',
          text_summary:
            'Deficiency means any fault, imperfection, or inadequacy in quality, nature, and manner of performance required under contract or law.',
          source_url: 'https://indiankanoon.org/doc/1786524/',
        },
        {
          act: 'Consumer Protection Act, 2019',
          section: 'Section 35',
          title: 'Manner in which complaint shall be made',
          text_summary:
            'Allows consumers to approach District Consumer Disputes Redressal Commission for claims and compensation.',
          source_url: 'https://indiankanoon.org/',
        },
      ],
      notes: 'Sending a formal pre-litigation legal notice often resolves consumer disputes before filing at District Forum.',
    },
    pdfResult: {
      documentTitle: 'Consumer Legal Notice — Demand for Refund & Compensation',
      documentType: 'notice',
      botMessage: 'Your Consumer Legal Notice is ready for download.',
    },
  },
};

export const LOADING_MESSAGES = {
  classifying: 'Reviewing applicable law...',
  extracting: 'Checking relevant sections...',
  reviewing: 'Analyzing your case...',
  generating: 'Drafting your notice...',
};
