export interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}

export interface HireMeButtonProps {
  onClick?: () => void;
  /** Stretches the button across a mobile menu row. */
  full?: boolean;
}
