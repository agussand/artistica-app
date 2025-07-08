export interface MenuItem{
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  roles: string[];
  shortcut?: string;
}
