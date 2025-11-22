import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Sidebar
      "schedule": "Schedule",
      "fixedBooking": "Fixed Booking",
      "bookingCategories": "Booking Categories",
      "customPaymentMethods": "Custom Payment Methods",
      "waitingList": "Waiting List",
      "coaches": "Coaches",
      "coachPackages": "Coach Packages",
      "coachesReporting": "Coaches Reporting",
      "billing": "BILLING",
      "reporting": "Reporting",
      
      // Header
      "padelHub": "Padel Hub",
      "court": "Court",
      "previous": "Previous",
      "next": "Next",
      "month": "Month",
      "week": "Week",
      "day": "Day",
      
      // Days
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday",
      "sunday": "Sunday",
      
      // Months
      "january": "January",
      "february": "February",
      "march": "March",
      "april": "April",
      "may": "May",
      "june": "June",
      "july": "July",
      "august": "August",
      "september": "September",
      "october": "October",
      "november": "November",
      "december": "December",
      
      // Court capacity
      "capacity": "{{count}}×{{count}}",
    }
  },
  ar: {
    translation: {
      // Sidebar
      "schedule": "الجدول الزمني",
      "fixedBooking": "الحجز الثابت",
      "bookingCategories": "فئات الحجز",
      "customPaymentMethods": "طرق الدفع المخصصة",
      "waitingList": "قائمة الانتظار",
      "coaches": "المدربون",
      "coachPackages": "باقات المدربين",
      "coachesReporting": "تقارير المدربين",
      "billing": "الفوترة",
      "reporting": "التقارير",
      
      // Header
      "padelHub": "نادي البادل",
      "court": "الملعب",
      "previous": "السابق",
      "next": "التالي",
      "month": "شهر",
      "week": "أسبوع",
      "day": "يوم",
      
      // Days
      "monday": "الإثنين",
      "tuesday": "الثلاثاء",
      "wednesday": "الأربعاء",
      "thursday": "الخميس",
      "friday": "الجمعة",
      "saturday": "السبت",
      "sunday": "الأحد",
      
      // Months
      "january": "يناير",
      "february": "فبراير",
      "march": "مارس",
      "april": "أبريل",
      "may": "مايو",
      "june": "يونيو",
      "july": "يوليو",
      "august": "أغسطس",
      "september": "سبتمبر",
      "october": "أكتوبر",
      "november": "نوفمبر",
      "december": "ديسمبر",
      
      // Court capacity
      "capacity": "{{count}}×{{count}}",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
