import { inject, injectable } from 'inversify'
import LRUCache from 'lru-cache'
import { VcJsonSchemaFetcher } from './vc-json-schema-fetcher'
import { VcJsonSchema } from './vc-json-schema'

const CACHE_OPTIONS: LRUCache.Options<string, VcJsonSchema> = {
  // 10 mbs
  maxSize: 10 * 1024 * 1024,
  sizeCalculation: (schema: VcJsonSchema) => schema.byteSize(),
}

@injectable()
export class JsonSchemaService {
  private readonly cache: LRUCache<string, VcJsonSchema>

  constructor(
    @inject(VcJsonSchemaFetcher) private readonly vcJsonSchemaFetcher: VcJsonSchemaFetcher,
  ) {
    this.cache = new LRUCache<string, VcJsonSchema>(CACHE_OPTIONS)
  }

  async getVcJsonSchemaByUrl(url: URL): Promise<VcJsonSchema> {
    const cacheKey = url.toString()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const schema = await this.vcJsonSchemaFetcher.fetch(url)

    this.cache.set(cacheKey, schema)

    return schema
  }
}
