import { nanoid } from 'nanoid'
import { SchemaField } from '@affinidi/affinidi-vc-schemas'

export type BuilderAttribute = {
  id: string
  parentId?: string
  name: string
  description: string
  type: string
  isRequired: boolean
}

export type BuilderSchema = {
  type: string
  description: string
  isPublic: boolean
  attributes: BuilderAttribute[]
}

