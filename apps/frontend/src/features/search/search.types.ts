export type SearchResultKind = 'club' | 'topic' | 'module';

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  /** Route to open when the result is selected. */
  path: string;
}
