export function getTrustRating(user_agent?: string, ip_address?: string): number {
  let rating = 0
  if (user_agent) {
    if (!user_agent.includes('Mozilla') &&
      !user_agent.includes('Chrome') &&
      !user_agent.includes('Safari')) {
      rating = 20
    } else
      rating += 50
  }

  // Check if IP adress is of admin or internal, these should be trusted nontheless
  if (ip_address) {
    if ([
      '81.246.79.247', // Jamie
      '81.246.79.248', // Thibaut
      '81.246.79.226'  // Group Claes WAN
    ].includes(ip_address))
      rating = 100
  }

  return rating
}

export function getImpersonation(username: string): { username: string, impersonated_user: string } | undefined {
  const r = new RegExp(/^((?<username>vangeyja|minnengu|nijsthib)(\$\$))*(?<email>[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g).exec(username)

  if (!r?.groups?.username) return

  const impersonated_user = r.groups.email
  switch (r.groups.username) {
    case 'vangeyja':
      username = "jamie.vangeysel@groupclaes.be"
      break

    case 'minnengu':
      username = "guy.minnen@groupclaes.be"
      break

    case 'nijsthib':
      username = "thibaut.nijs@groupclaes.be"
      break
  }

  return {
    username,
    impersonated_user
  }
}