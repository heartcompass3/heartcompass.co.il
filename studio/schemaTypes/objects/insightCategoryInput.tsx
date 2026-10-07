import {useCallback, type ChangeEvent} from 'react'
import {set, useFormValue, type StringInputProps} from 'sanity'
import {Select} from '@sanity/ui'
import {insightCategoriesByDomain, insightDomains} from './insightsTaxonomy'

export function InsightCategoryInput(props: StringInputProps) {
  const domain = useFormValue([...props.path.slice(0, -1), 'domain']) as string | undefined
  const {onChange} = props
  const domainName = insightDomains.find((item) => item.id === domain)?.name
  const categories = domain
    ? insightCategoriesByDomain[domain as keyof typeof insightCategoriesByDomain] || []
    : []

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onChange(set(event.currentTarget.value))
    },
    [onChange],
  )

  return (
    <Select
      {...props.elementProps}
      value={props.value || ''}
      disabled={props.readOnly || !domain}
      onChange={handleChange}
    >
      <option value="">{domainName ? `בחרו קטגוריה — ${domainName}` : 'בחרו קודם תחום'}</option>
      {props.value && !categories.includes(props.value) ? (
        <option value={props.value}>הקטגוריה הקודמת אינה שייכת לתחום שנבחר — בחרו מחדש</option>
      ) : null}
      {categories.map((category) => (
        <option key={category} value={category}>
          {domainName} › {category}
        </option>
      ))}
    </Select>
  )
}
