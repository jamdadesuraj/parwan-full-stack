import { currency } from '@/context/constants'
import { PageType, StatType } from './types'

export const stateData: StatType[] = [
    {
    icon: 'solar:cart-large-2-bold-duotone',
  name: 'Total Products Enquiries',
    amount: '1,236',
    bg: '#ECFDF3',
    change: '10.6',
  },
  {
    icon: 'solar:box-bold-duotone',
    name: 'Total Contact Enquiries',
    amount: '13,647',
    bg: '#EAF2FF',
    change: '2.3',
  },

  {
    icon: 'solar:bag-check-bold-duotone',
    name: "Total Products",
    amount: '185',
    bg: '#FFF8E6',
    change: '6.4',
  },

]

export const pagesList: PageType[] = [
  {
    path: 'larkon/ecommerce.html',
    views: 465,
    rate: '4.4',
    variant: 'success',
  },
  {
    path: 'larkon/dashboard.html',
    views: 426,
    rate: '20.4',
    variant: 'danger',
  },
  {
    path: 'larkon/chat.html',
    views: 254,
    rate: '12.25',
    variant: 'warning',
  },
  {
    path: 'larkon/auth-login.html',
    views: 3369,
    rate: '5.2',
    variant: 'success',
  },
  {
    path: 'larkon/email.html',
    views: 985,
    rate: '64.2',
    variant: 'danger',
  },
  {
    path: 'larkon/social.html',
    views: 653,
    rate: '2.4',
    variant: 'success',
  },
  {
    path: 'larkon/blog.html',
    views: 478,
    rate: '1.4',
    variant: 'danger',
  },
]
