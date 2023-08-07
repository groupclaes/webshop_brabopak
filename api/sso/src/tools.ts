const adminReg = new RegExp(/^((?<username>vangeyja|minnengu|nijsthib)(\$\$))*(?<email>[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g)

export function getTrustRating(user_agent?: string): number {
  if (user_agent) {
    if (!user_agent.includes('Mozilla') &&
      !user_agent.includes('Chrome') &&
      !user_agent.includes('Safari'))
      return 20
    return 50
  }

  return 0
}

export function getImpersonation(username: string): { username: string, impersonated_user: string } | undefined {
  const r = adminReg.exec(username)

  if (!r || !r.groups || !r.groups.username)
    return
  
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