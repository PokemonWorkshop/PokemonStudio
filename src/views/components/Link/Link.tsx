import React from 'react';
import LinkProps from './LinkPropsInterface';
import LinkStyle from './LinkStyle';

const Link = ({ external, href, text }: LinkProps) => {
  return (
    <LinkStyle target={external ? '_blank' : ''} href={href}>
      {text}
    </LinkStyle>
  );
};

export { Link };
