import './studio.css'

import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const HIDE_TYPES = new Set(['post', 'author', 'category'])

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
          .items(
            S.documentTypeListItems().filter((item) => {
              const id = item.getId()
              return id ? !HIDE_TYPES.has(id) : true
            }),
          ),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
