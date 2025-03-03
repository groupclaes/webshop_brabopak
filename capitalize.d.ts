declare function capitalize(input: string, preserve?: boolean | any): string;
declare namespace capitalize {
  /**
   * Capitalize each word in a string
   * @param input the string to capitalize
   * @param [preserve] preserve casing of the rest of the strings content
   */
  function words(input: string, preserve?: boolean | any): string;
}
export = capitalize;