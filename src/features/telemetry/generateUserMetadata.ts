const INTERNAL_DOMAINS = ['affinidi.com', 'trustana.com', 'goodworker.in', 'lemmatree.com']

export async function generateUserMetadata(userEmail: string | undefined) {
  if (!userEmail) {
    return {}
  }

  const domain = userEmail.split('@')[1]
  const isUserInternal = INTERNAL_DOMAINS.includes(domain)
  const internalUserVertical = isUserInternal ? domain : undefined

  return {
    isUserInternal,
    internalUserVertical,
  }
}
