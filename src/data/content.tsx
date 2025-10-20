// About section is separate and used in Hero component
export const aboutContent = {
  number: "01",
  title: "About",
  description: "Samuel Vanderpump is CEO and Founder of Vanderpump FX, specialising in finance and foreign exchange. Beyond his work in finance, Samuel serves as an ambassador for charitable organisations, and is recognised as a television personality and podcast host, connecting with audiences on topics spanning business, culture, and philanthropy."
};

// Main content sections as an array
export const contentSections = [
  {
    id: "vanderpump-fx",
    number: "02",
    title: "Vanderpump FX",
    logo: "/logos/vanderpumpfx.png",
    link: "https://vanderpumpfx.com",
    linkText: "Visit Vanderpump FX",
    role: "Founder & CEO",
    description: "Vanderpump FX is a leading currency exchange brokerage specialising in competitive rates and personalised service for individuals and businesses. The company provides expert guidance on foreign exchange transactions, helping clients navigate international markets with confidence and secure optimal exchange rates for their currency needs."
  },
  {
    id: "vanderpod",
    number: "03",
    title: "Vanderpod",
    logo: "/logos/vanderpod.jpg",
    link: "https://youtube.com/@vanderpodofficial?si=6h4zXKH2vTt5jvS0",
    linkText: "Listen to Vanderpod",
    role: "Founder & Presenter",
    description: "Vanderpod is a podcast exploring the intersection of business, culture, and lifestyle. As founder and presenter, Samuel brings compelling conversations with entrepreneurs, innovators, and thought leaders, offering insights into the challenges and triumphs of building successful ventures while maintaining authenticity and purpose."
  },
  {
    id: "television",
    number: "04",
    title: "Television",
    shows: [
      {
        name: "Made in Chelsea",
        network: "E4",
        logo: "/logos/mic.png",
        link: "https://www.channel4.com/programmes/made-in-chelsea?cntsrc=social_share_ios_made_in_chelsea",
        description: "Featured cast member on the award-winning reality series chronicling the lives of affluent young people in West London."
      },
      {
        name: "Vanderpump Villa",
        network: "Hulu",
        logo: "/logos/vanderpumpvilla.webp",
        link: "https://www.hulu.com/series/vanderpump-villa-bf42f6f5-db26-4429-85e0-17e86d161c98",
        description: "Reality series following the operations of an exclusive villa led by Lisa Vanderpump, showcasing luxury hospitality and interpersonal dynamics."
      }
    ]
  },
  {
    id: "charity",
    number: "05",
    title: "Charitable Work",
    ambassadorships: [
      {
        organization: "The UK Sepsis Trust",
        link: "https://sepsistrust.org",
        logo: "/logos/sepsis.webp",
        description: "Ambassador for the UK's leading sepsis charity, raising awareness of this life-threatening condition and supporting initiatives to improve early detection and treatment across healthcare settings."
      },
      {
        organization: "NHS Blood and Transplant",
        division: "Organ Donation",
        link: "https://www.nhsbt.nhs.uk",
        logo: "/logos/organ.png",
        description: "Ambassador promoting organ donation awareness and encouraging registration on the NHS Organ Donor Register, helping to save and transform lives through the gift of transplantation."
      }
    ]
  },
  {
    id: "contact",
    number: "06",
    title: "Contact",
    email: "hello@samuelvanderpump.com",
    description: "For business enquiries, media requests, or charitable partnership opportunities, please get in touch.",
    socialLinks: [
      { platform: "Instagram", url: "https://www.instagram.com/samvanderpump?igsh=ZXFjN3l1eHBjczk0&utm_source=qr" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/samuel-vanderpump-520660110?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
      { platform: "TikTok", url: "https://www.tiktok.com/@sam_vanderpump?_t=ZN-90gj6HPu0MJ&_r=1" },
      { platform: "Facebook", url: "https://www.facebook.com/share/1GbjL4uGQw/?mibextid=wwXIfr" },
      { platform: "Youtube", url: "https://youtube.com/@vanderpodofficial?si=6h4zXKH2vTt5jvS0" },
    ]
  }
];

// TypeScript types
export type ContentSection = typeof contentSections[number];
