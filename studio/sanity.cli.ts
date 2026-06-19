import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'bk4y5jiw',
    dataset: 'production',
  },
  // הסטודיו המתארח: https://heartcompass3.sanity.studio (appId d6ft51b6eo38rsh1cf60yf9e).
  // זהו הסטודיו היחיד בשימוש, והריפו הזה הוא מקור האמת לסכימה (superset מלא),
  // לכן פריסה ממנו בטוחה — הוספה בלבד, לא מורידה טיפוסים/שדות.
  // ⚠️ אל תפרוס מהריפו הישן (heartcompass-main/studio2) — הסכימה שם חלקית
  //    (אין article/page) ותשבור עריכה בסטודיו.
  deployment: {
    appId: 'd6ft51b6eo38rsh1cf60yf9e',
    autoUpdates: true,
  },
})
