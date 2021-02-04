import React, { FunctionComponent } from 'react';
import LinkProps from './LinkPropsInterface';
import LinkStyle from './LinkStyle';

const Link: FunctionComponent<LinkProps> = (props: LinkProps) => {
  const { external, href, text } = props;
  return (
    <LinkStyle target={external ? '_blank' : ''} href={href}>
      {text}
    </LinkStyle>
  );
};

export { Link };
