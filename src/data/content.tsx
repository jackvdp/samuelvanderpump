// About section is separate and used in Hero component
export const aboutContent = {
  number: "00",
  title: "About",
  description: "Samuel Vanderpump is CEO and Founder of Vanderpump FX, specialising in finance and foreign exchange. Beyond his work in finance, Samuel serves as an ambassador for charitable organisations, and is recognised as a television personality and podcast host, connecting with audiences on topics spanning business, culture, and philanthropy."
};

// Main content sections as an array
export const contentSections = [
  {
    id: "vanderpump-fx",
    number: "01",
    title: "Vanderpump FX",
    logo: "/logos/vanderpumpfx.png",
    link: "https://vanderpumpfx.com",
    linkText: "Visit Vanderpump FX",
    role: "Founder & CEO",
    description: "Vanderpump FX is a leading currency exchange brokerage specialising in competitive rates and personalised service for individuals and businesses. The company provides expert guidance on foreign exchange transactions, helping clients navigate international markets with confidence and secure optimal exchange rates for their currency needs."
  },
  {
    id: "vanderpod",
    number: "02",
    title: "Vanderpod",
    logo: "/logos/vanderpod.jpg",
    link: "/404",
    linkText: "Listen to Vanderpod",
    role: "Founder & Presenter",
    description: "Vanderpod is a podcast exploring the intersection of business, culture, and lifestyle. As founder and presenter, Samuel brings compelling conversations with entrepreneurs, innovators, and thought leaders, offering insights into the challenges and triumphs of building successful ventures while maintaining authenticity and purpose."
  },
  {
    id: "television",
    number: "03",
    title: "Television",
    shows: [
      {
        name: "Made in Chelsea",
        network: "E4",
        description: "Featured cast member on the award-winning reality series chronicling the lives of affluent young people in West London."
      },
      {
        name: "Vanderpump Villa",
        network: "Hulu",
        description: "Reality series following the operations of an exclusive French chateau, showcasing luxury hospitality and interpersonal dynamics."
      }
    ]
  },
  {
    id: "charity",
    number: "04",
    title: "Charitable Work",
    ambassadorships: [
      {
        organization: "The UK Sepsis Trust",
        link: "https://sepsistrust.org",
        description: "Ambassador for the UK's leading sepsis charity, raising awareness of this life-threatening condition and supporting initiatives to improve early detection and treatment across healthcare settings."
      },
      {
        organization: "NHS Blood and Transplant",
        division: "Organ Donation",
        link: "https://www.nhsbt.nhs.uk",
        description: "Ambassador promoting organ donation awareness and encouraging registration on the NHS Organ Donor Register, helping to save and transform lives through the gift of transplantation."
      }
    ]
  },
  {
    id: "contact",
    number: "05",
    title: "Contact",
    email: "hello@samuelvanderpump.com",
    description: "For business enquiries, media requests, or charitable partnership opportunities, please get in touch.",
    socialLinks: [
      { platform: "Instagram", url: "https://www.instagram.com/samvanderpump?igsh=ZXFjN3l1eHBjczk0&utm_source=qr" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/samuel-vanderpump-520660110?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
      { platform: "TikTok", url: "https://www.tiktok.com/@sam_vanderpump?_t=ZN-90gj6HPu0MJ&_r=1" },
      { platform: "Facebook", url: "https://www.facebook.com/share/1GbjL4uGQw/?mibextid=wwXIfr" },
    ]
  }
];

// TypeScript types
export type ContentSection = typeof contentSections[number];
