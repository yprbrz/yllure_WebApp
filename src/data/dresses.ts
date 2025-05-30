export interface Dress {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  featured: boolean;
  availability: boolean;
  category: string;
}

export const dresses: Dress[] = [
  {
    id: 1,
    name: "Aurora Evening Gown",
    description: "A stunning evening gown with delicate beading and a flowing silhouette. Perfect for formal events and galas.",
    price: 85,
    images: ["/images/dress1.jpg", "/images/dress1-alt.jpg", "/images/dress1-back.jpg"],
    colors: ["Emerald", "Navy", "Burgundy"],
    sizes: ["14", "16", "18", "20", "22"],
    featured: true,
    availability: true,
    category: "Evening"
  },
  {
    id: 2,
    name: "Bella Cocktail Dress",
    description: "A sophisticated cocktail dress with a flattering A-line cut and subtle shimmering details.",
    price: 65,
    images: ["/images/dress2.jpg", "/images/dress2-alt.jpg"],
    colors: ["Black", "Champagne", "Blush"],
    sizes: ["14", "16", "18", "20", "22", "24"],
    featured: true,
    availability: true,
    category: "Cocktail"
  },
  {
    id: 3,
    name: "Celine Wrap Dress",
    description: "A versatile wrap dress that flatters every curve. Elegant draping and adjustable fit for maximum comfort.",
    price: 55,
    salePrice: 45,
    images: ["/images/dress3.jpg", "/images/dress3-alt.jpg"],
    colors: ["Ruby", "Sapphire", "Emerald", "Onyx"],
    sizes: ["14", "16", "18", "20", "22", "24", "26"],
    featured: true,
    availability: true,
    category: "Casual"
  },
  {
    id: 4,
    name: "Diana Maxi Dress",
    description: "A flowing maxi dress with elegant draping and a flattering neckline. Perfect for summer events.",
    price: 70,
    images: ["/images/dress4.jpg", "/images/dress4-alt.jpg"],
    colors: ["Coral", "Teal", "Lavender"],
    sizes: ["14", "16", "18", "20", "22"],
    featured: false,
    availability: true,
    category: "Casual"
  },
  {
    id: 5,
    name: "Eliza Formal Gown",
    description: "A glamorous formal gown with intricate lace detailing and a dramatic silhouette.",
    price: 95,
    images: ["/images/dress5.jpg", "/images/dress5-alt.jpg"],
    colors: ["Wine", "Midnight", "Emerald"],
    sizes: ["16", "18", "20", "22", "24"],
    featured: false,
    availability: true,
    category: "Evening"
  },
  {
    id: 6,
    name: "Florence Party Dress",
    description: "A fun and flirty party dress with gorgeous detailing and a playful hemline.",
    price: 60,
    images: ["/images/dress6.jpg", "/images/dress6-alt.jpg"],
    colors: ["Silver", "Gold", "Black"],
    sizes: ["14", "16", "18", "20"],
    featured: false,
    availability: true,
    category: "Cocktail"
  },
  {
    id: 7,
    name: "Grace Sheath Dress",
    description: "A tailored sheath dress that celebrates your curves with sophisticated style.",
    price: 75,
    images: ["/images/dress7.jpg", "/images/dress7-alt.jpg"],
    colors: ["Navy", "Plum", "Forest"],
    sizes: ["14", "16", "18", "20", "22", "24"],
    featured: false,
    availability: false,
    category: "Business"
  },
  {
    id: 8,
    name: "Helena Ballgown",
    description: "A showstopping ballgown with a structured bodice and voluminous skirt.",
    price: 110,
    images: ["/images/dress8.jpg", "/images/dress8-alt.jpg"],
    colors: ["Rose Gold", "Sapphire", "Emerald"],
    sizes: ["16", "18", "20", "22"],
    featured: false,
    availability: true,
    category: "Evening"
  },
  {
    id: 9,
    name: "Iris Midi Dress",
    description: "A chic midi dress with modern details and a timeless silhouette.",
    price: 65,
    salePrice: 55,
    images: ["/images/dress9.jpg", "/images/dress9-alt.jpg"],
    colors: ["Dusty Rose", "Sage", "Slate"],
    sizes: ["14", "16", "18", "20", "22", "24", "26"],
    featured: false,
    availability: true,
    category: "Casual"
  }
];

export const getDressById = (id: number): Dress | undefined => {
  return dresses.find(dress => dress.id === id);
};

export const getFeaturedDresses = (): Dress[] => {
  return dresses.filter(dress => dress.featured);
};