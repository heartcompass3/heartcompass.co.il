import './studio.css'

import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const HIDE_TYPES = new Set(['post', 'author', 'category', 'siteSettings'])
const SITE_SETTINGS_ID = 'dc305947-0f77-4a4e-86c7-8e0082aec84f'

export default defineConfig({
  name: 'default',
  title: 'HeartCompass Studio',

  projectId: 'bk4y5jiw',
  dataset: 'production',

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('הגדרות אתר')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId(SITE_SETTINGS_ID),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => {
              const id = item.getId()
              return id ? !HIDE_TYPES.has(id) : true
            }),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
