/* eslint-disable max-classes-per-file, no-underscore-dangle */
import {
  Event,
  EventEmitter,
  TextDocumentContentProvider,
  TextDocumentShowOptions,
  Uri,
  window,
  workspace,
} from 'vscode'
import { ext } from '../extensionVariables'
import { nonNullValue } from './nonNull'
import { randomUtils } from './randomUtils'

let cachedScheme: string | undefined
function getScheme(): string {
  if (!cachedScheme) {
    // Generate a unique scheme so that multiple extensions using this same code don't conflict with each other
    cachedScheme = `affinidi${randomUtils.getRandomHexString(6)}`
  }
  return cachedScheme
}

export class ReadOnlyContent {
  private readonly _uri: Uri

  private readonly _emitter: EventEmitter<Uri>

  private _content: string

  constructor(uri: Uri, emitter: EventEmitter<Uri>, content: string) {
    this._uri = uri
    this._emitter = emitter
    this._content = content
  }

  public get content(): string {
    return this._content
  }

  public async append(content: string): Promise<void> {
    this._content += content
    this._emitter.fire(this._uri)
  }

  public clear(): void {
    this._content = ''
    this._emitter.fire(this._uri)
  }
}

class ReadOnlyContentProvider implements TextDocumentContentProvider {
  private readonly _onDidChangeEmitter: EventEmitter<Uri> = new EventEmitter<Uri>()

  private readonly _contentMap: Map<string, ReadOnlyContent> = new Map<string, ReadOnlyContent>()

  public get onDidChange(): Event<Uri> {
    return this._onDidChangeEmitter.event
  }

  public async openReadOnlyContent(
    node: { label: string; id: string },
    content: string,
    fileExtension: string,
    options?: TextDocumentShowOptions,
  ): Promise<ReadOnlyContent> {
    const scheme = getScheme()
    const idHash: string = randomUtils.getPseudononymousStringHash(node.id, 'hex')
    // Remove special characters which may prove troublesome when parsing the uri. We'll allow the same set as `encodeUriComponent`
    // eslint-disable-next-line no-useless-escape
    const fileName = node.label.replace(/[^a-z0-9\-\_\.\!\~\*\'\(\)]/gi, '_')
    const uri: Uri = Uri.parse(`${scheme}:///${idHash}/${fileName}${fileExtension}`)
    const readOnlyContent: ReadOnlyContent = new ReadOnlyContent(
      uri,
      this._onDidChangeEmitter,
      content,
    )
    this._contentMap.set(uri.toString(), readOnlyContent)
    await window.showTextDocument(uri, options)
    this._onDidChangeEmitter.fire(uri)
    return readOnlyContent
  }

  public async provideTextDocumentContent(uri: Uri): Promise<string> {
    const readOnlyContent: ReadOnlyContent = nonNullValue(
      this._contentMap.get(uri.toString()),
      'ReadOnlyContentProvider._contentMap.get',
    )
    return readOnlyContent.content
  }
}

let cachedContentProvider: ReadOnlyContentProvider | undefined
function getContentProvider(): ReadOnlyContentProvider {
  if (!cachedContentProvider) {
    cachedContentProvider = new ReadOnlyContentProvider()
    ext.context.subscriptions.push(
      workspace.registerTextDocumentContentProvider(getScheme(), cachedContentProvider),
    )
  }
  return cachedContentProvider
}

interface Item {
  label: string
  id: string
}

export async function openReadOnlyContent({
  node,
  content,
  fileExtension = '.json',
  options,
}: {
  node: Item
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  fileExtension?: string
  options?: TextDocumentShowOptions
}): Promise<ReadOnlyContent> {
  const contentProvider = getContentProvider()
  return contentProvider.openReadOnlyContent(
    node,
    JSON.stringify(content, null, 2),
    fileExtension,
    options,
  )
}
