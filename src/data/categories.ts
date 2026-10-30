import { type Category } from '@/types';

/**
 * Product categories for TechHunterBD.
 * Icon names correspond to Lucide React icon components.
 */
export const categories: Category[] = [
  {
    id: 'cat-001',
    name: 'Smartphones',
    slug: 'smartphones',
    icon: 'Smartphone',
    image: '/categories/smartphones.jpg',
    productCount: 3,
    description:
      'Latest flagship and mid-range smartphones from top global brands with official Bangladesh warranty.',
  },
  {
    id: 'cat-002',
    name: 'Laptops',
    slug: 'laptops',
    icon: 'Laptop',
    image: '/categories/laptops.jpg',
    productCount: 2,
    description:
      'Gaming laptops, ultrabooks, and workstations for every budget and workflow.',
  },
  {
    id: 'cat-003',
    name: 'Audio',
    slug: 'audio',
    icon: 'Headphones',
    image: '/categories/audio.jpg',
    productCount: 3,
    description:
      'Premium headphones, earbuds, and speakers for audiophiles and casual listeners.',
  },
  {
    id: 'cat-004',
    name: 'Gaming',
    slug: 'gaming',
    icon: 'Gamepad2',
    image: '/categories/gaming.jpg',
    productCount: 1,
    description:
      'Consoles, controllers, and gaming accessories for the ultimate gaming setup.',
  },
  {
    id: 'cat-005',
    name: 'Wearables',
    slug: 'wearables',
    icon: 'Watch',
    image: '/categories/wearables.jpg',
    productCount: 2,
    description:
      'Smartwatches and fitness trackers from Apple, Samsung, and more.',
  },
  {
    id: 'cat-006',
    name: 'Accessories',
    slug: 'accessories',
    icon: 'Cable',
    image: '/categories/accessories.jpg',
    productCount: 4,
    description:
      'Chargers, power banks, keyboards, mice, and essential tech accessories.',
  },
  {
    id: 'cat-007',
    name: 'PC Components',
    slug: 'pc-components',
    icon: 'Cpu',
    image: '/categories/pc-components.jpg',
    productCount: 4,
    description:
      'Processors, GPUs, RAM, SSDs, and everything you need to build your dream PC.',
  },
  {
    id: 'cat-008',
    name: 'Tablets',
    slug: 'tablets',
    icon: 'Tablet',
    image: '/categories/tablets.jpg',
    productCount: 2,
    description:
      'Android, iPadOS, and Windows tablets for work, study, and entertainment.',
  },
];
