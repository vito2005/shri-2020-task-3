export const getMod = (property: any, modName: string) => {
  if (property) {
    return property.value.children.find((node: any) => node.key.value === modName)
  }
}

export const sizes = ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'xxxxl']
export const marketingBlocks = ['commercial', 'offer']
