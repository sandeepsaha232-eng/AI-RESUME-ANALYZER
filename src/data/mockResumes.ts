import { Resume } from '../types';

export const mockResumes: Resume[] = [
  {
    id: 'res-1',
    title: 'Senior Software Engineer',
    lastEdited: '2026-07-09T18:30:00Z',
    atsScore: 84,
    personalInfo: {
      fullName: 'Sandeep Sharma',
      email: 'sandeep.sharma@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      website: 'https://sandeepdev.io',
      linkedin: 'linkedin.com/in/sandeepsharma',
      github: 'github.com/sandeepsharma'
    },
    summary: 'Senior Software Engineer with 6+ years of experience designing and implementing scalable distributed systems, cloud-native architectures, and responsive frontend applications. Expert in React, TypeScript, Node.js, and Google Cloud Platform, with a proven track record of improving system latency by 35% and leading cross-functional teams of engineers.',
    experience: [
      {
        id: 'exp-1',
        company: 'CloudScale Technologies',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2023-01',
        endDate: '',
        current: true,
        bullets: [
          'Architected and deployed a micro-frontend dashboard platform using React and Webpack Module Federation, reducing build times by 40% and enabling independent deployments for 5 product teams.',
          'Optimized serverless backend services in Google Cloud Functions, reducing database CPU utilization by 25% and cutting cold-start latencies in half.',
          'Led a team of 4 engineers to rebuild the core billing workflow, integrating Stripe Elements and Stripe billing APIs, successfully processing over $2.5M in monthly recurring revenue with 99.99% uptime.',
          'Spearheaded developer experience improvements by introducing strict TypeScript guidelines, automated ESLint/Prettier pipelines, and comprehensive unit-testing patterns.'
        ]
      },
      {
        id: 'exp-2',
        company: 'Innovate Systems',
        position: 'Software Engineer II',
        location: 'Austin, TX',
        startDate: '2020-05',
        endDate: '2022-12',
        current: false,
        bullets: [
          'Engineered real-time collaboration features using WebSockets and Socket.io, improving user retention by 18% and decreasing concurrent connection drop rates.',
          'Designed and maintained highly performant RESTful APIs using Node.js, Express, and PostgreSQL, supporting over 100k active daily users.',
          'Refactored legacy state management from complex Redux structures to modern React Context and TanStack Query, reducing bundle sizes by 45KB.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        location: 'Berkeley, CA',
        startDate: '2016-09',
        endDate: '2020-05',
        current: false,
        gpa: '3.82'
      }
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'SyncFlow Canvas',
        role: 'Creator & Lead Developer',
        url: 'https://github.com/sandeepsharma/syncflow',
        startDate: '2022-02',
        endDate: '2022-08',
        bullets: [
          'Developed an open-source collaborative whiteboarding canvas using React, Canvas API, and WebSockets, gaining over 1,200 GitHub stars.',
          'Implemented highly optimized vector path drawing and group transformations, preserving 60FPS fluid rendering under heavy stress loads.'
        ]
      }
    ],
    skills: [
      'React',
      'TypeScript',
      'JavaScript (ES6+)',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Redis',
      'Docker',
      'Google Cloud Platform (GCP)',
      'Kubernetes',
      'GraphQL',
      'Tailwind CSS',
      'Git',
      'CI/CD'
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Google Cloud Professional Cloud Architect',
        issuer: 'Google Cloud',
        date: '2024-03',
        url: ''
      }
    ],
    languages: [
      { id: 'lang-1', name: 'English', proficiency: 'Full Professional' },
      { id: 'lang-2', name: 'Hindi', proficiency: 'Native' }
    ]
  },
  {
    id: 'res-2',
    title: 'Product Marketing Manager',
    lastEdited: '2026-07-08T11:15:00Z',
    atsScore: 78,
    personalInfo: {
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 (555) 014-9981',
      location: 'New York, NY',
      website: 'https://sarahjmarketing.com',
      linkedin: 'linkedin.com/in/sarahjmarketing',
      github: ''
    },
    summary: 'Results-driven Product Marketing Manager with 4+ years of experience leading go-to-market (GTM) strategy, product launches, and digital campaigns in fast-paced B2B SaaS environments. Adept at turning complex technical features into high-converting user messaging and increasing conversion rates by up to 28%.',
    experience: [
      {
        id: 'exp-3',
        company: 'Aura Analytics',
        position: 'Product Marketing Manager',
        location: 'New York, NY',
        startDate: '2022-06',
        endDate: '',
        current: true,
        bullets: [
          'Led the messaging and GTM launch for Aura 3.0 platform, resulting in a 24% increase in platform signups in the first 90 days.',
          'Conducted regular user research, competitive analysis, and stakeholder workshops to develop standard user personas used company-wide.',
          'Authored high-converting landing page copy, sales enablement collateral, and email newsletters, scaling CTR by 15% and SQL creation by 10%.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-2',
        institution: 'New York University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Marketing & Communications',
        location: 'New York, NY',
        startDate: '2018-09',
        endDate: '2022-05',
        current: false,
        gpa: '3.75'
      }
    ],
    projects: [
      {
        id: 'proj-2',
        name: 'SaaS Growth Playbook',
        role: 'Co-Author',
        url: '',
        startDate: '2023-01',
        endDate: '2023-04',
        bullets: [
          'Compiled and structured actionable marketing playbooks used by over 500 early-stage startups, generating 8,000 lead conversions.',
          'Designed data visualizations for digital channels explaining customer acquisition cost (CAC) and lifetime value (LTV) models.'
        ]
      }
    ],
    skills: [
      'GTM Strategy',
      'User Personas',
      'Competitive Analysis',
      'Copywriting',
      'Email Marketing',
      'SEO/SEM',
      'Google Analytics',
      'HubSpot',
      'Product Messaging',
      'User Research',
      'Content Strategy',
      'A/B Testing'
    ],
    certifications: [],
    languages: [
      { id: 'lang-3', name: 'English', proficiency: 'Native' },
      { id: 'lang-4', name: 'Spanish', proficiency: 'Professional Working' }
    ]
  }
];
