
export interface Book {
  ISBN: number
  title: string
  author: string
  navbarTextColor: string
  pageBackgroundColor: string
  titleColor: string
  bodyTextColor: string
  totalPages: number
  tags: string[],
}

export interface LibraryBook extends Book {
  available: boolean
  did: string
  reads: number
  image: string
}

export const uniqueBooks: Book[] = [
  {
    ISBN: 9781623170745,
    title: "Free to Make: How the Maker Movement is Changing Our Schools, Our Jobs, and Our Minds",
    author: "by Dale Dougherty, Ariane Conrad (Contributor)",
    navbarTextColor: "black",
    pageBackgroundColor: "ffffff",
    titleColor: "E31313",
    bodyTextColor: "000000",
    totalPages: 271,
    tags: ["social revolution", "technology", "community"],
  },
  {
    ISBN: 9781937146580,
    title: "From Bitcoin to Burning Man and Beyond",
    author: "by John Clippinger (Editor), David Bollier (Editor)",
    navbarTextColor: "black",
    pageBackgroundColor: "01ABF2",
    titleColor: "FFF000",
    bodyTextColor: "000000",
    totalPages: 194,
    tags: ["bitcoin", "cryptocurrency", "innovation"],
  },
  {
    ISBN: 9780990489177,
    title: "It's a Shareable Life: A Practical Guide on Sharing",
    author: "by Chelsea Rustrum, Gabriel Stempinski, Alexandra Liss",
    navbarTextColor: "black",
    pageBackgroundColor: "ffffff",
    titleColor: "008FA9",
    bodyTextColor: "FF7837",
    totalPages: 355,
    tags: ["shared economy", "social good", "sustainable economy"],
  },
  {
    ISBN: 9781719127141,
    title: "Blockchain Government: A next form of infrastructure for the twenty-first century",
    author: "by Myungsan Jun",
    navbarTextColor: "white",
    pageBackgroundColor: "04114F",
    titleColor: "ffffff",
    bodyTextColor: "FFEC00",
    totalPages: 233,
    tags: ["consensus mechanisms", "bureaucracy", "administration"],
  },
  {
    ISBN: 9781523930470,
    title: "Ethereum: Blockchains, Digital Assets, Smart Contracts, Decentralised",
    author: "by Henning Diedrich",
    navbarTextColor: "black",
    pageBackgroundColor: "ffffff",
    titleColor: "000000",
    bodyTextColor: "787878",
    totalPages: 219,
    tags: ["Ethereum", "smart contracts", "decentralisation"],
  },
  {
    ISBN: 9780393634990,
    title: "Hello World: Being Human in the Age of Algorithms",
    author: "by Hannah Fry",
    navbarTextColor: "white",
    pageBackgroundColor: "00A8A9",
    titleColor: "F3ED00",
    bodyTextColor: "ffffff",
    totalPages: 207,
    tags: ["AI", "perception", "responsibility", "experiments"],
  },
  {
    ISBN: 9780198739838,
    title: "Superintelligence: Paths, Dangers, Strategies",
    author: "by Nick Bostrom",
    navbarTextColor: "black",
    pageBackgroundColor: "ffffff",
    titleColor: "080607",
    bodyTextColor: "7F2F2C",
    totalPages: 358,
    tags: ["experiments", "AI", "human brain"],
  },
  {
    ISBN: 9780062018205,
    title: "Predictably Irrational: The Hidden Forces That Shape Our Decisions",
    author: "by Dr. Dan Ariely",
    navbarTextColor: "white",
    pageBackgroundColor: "057ACB",
    titleColor: "ffffff",
    bodyTextColor: "000000",
    totalPages: 325,
    tags: ["experiments", "human brain", "perception"],
  },
  {
    ISBN: 9780241957219,
    title: "Who Owns The Future?",
    author: "by Jaron Lanier",
    navbarTextColor: "black",
    pageBackgroundColor: "74E034",
    titleColor: "ffffff",
    bodyTextColor: "000000",
    totalPages: 362,
    tags: ["digital networks", "AI", "privacy"],
  },
  {
    ISBN: 9780465094257,
    title: "Lost in Math: How Beauty Leads Physics Astray",
    author: "by Sabine Hossenfelder",
    navbarTextColor: "white",
    pageBackgroundColor: "0C0413",
    titleColor: "ffffff",
    bodyTextColor: "948FA5",
    totalPages: 248,
    tags: ["physics", "hunam brain", "perception"],
  },
  {
    ISBN: 9780316508278,
    title: "Move Fast and Break Things: How Facebook, Google, and Amazon Cornered Culture and Undermined Democracy",
    author: "by Jonathan Taplin",
    navbarTextColor: "white",
    pageBackgroundColor: "00ACFB",
    titleColor: "ffffff",
    bodyTextColor: "060D6B",
    totalPages: 286,
    tags: ["monopolization", "content", "platforms"],
  },
  {
    ISBN: 9780262029575,
    title: "The Stack: On Software and Sovereignty",
    author: "by Benjamin H. Bratton",
    navbarTextColor: "black",
    pageBackgroundColor: "ffffff",
    titleColor: "000000",
    bodyTextColor: "000000",
    totalPages: 365,
    tags: ["smart contracts", "system thinking", "social change"],
  },
  {
    ISBN: 9781787330672,
    title: "21 Lessons for the 21st Century",
    author: "by Yuval Noah Harari",
    navbarTextColor: "black",
    pageBackgroundColor: "FEFDE6",
    titleColor: "AE7827",
    bodyTextColor: "000000",
    totalPages: 321,
    tags: ["history review", "social change", "human brain"],
  },
  {
    ISBN: 9781250107817,
    title: "Factfulness: Ten Reasons We're Wrong About the World– and Why Things Are Better Than You Think",
    author: "by Hans Rosling, Anna Rosling Rönnlund, Ola Rosling",
    navbarTextColor: "black",
    pageBackgroundColor: "FF5C00",
    titleColor: "FFFFFF",
    bodyTextColor: "000000",
    totalPages: 329,
    tags: ["experiments", "social change", "responsibility"],
  },
  {
    ISBN: 9781260026672,
    title: "Cryptoassets: The Innovative Investor's Guide to Bitcoin and Beyond",
    author: "by Chris Burniske, Jack Tatar",
    navbarTextColor: "black",
    pageBackgroundColor: "ffffff",
    titleColor: "5EB840",
    bodyTextColor: "000000",
    totalPages: 284,
    tags: ["cryptocurrency", "smart contracts", "decentralisation"],
  }
]
