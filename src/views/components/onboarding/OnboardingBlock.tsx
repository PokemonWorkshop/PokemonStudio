import React from 'react';
import styled from 'styled-components';

const OnboardingBlockContainer = styled.div`
  &.validate {
    /*background-color: */
  }

  &.current {
  }

  &.noValidate {
  }
`;

type OnboardingBlockProps = {
  type: 'validate' | 'current' | 'noValidate';
  title: string;
  message: string;
  index: number;
  max: number;
  action: () => void;
};

export const OnboardingBlock = ({ type, title, message, index, max, action }: OnboardingBlockProps) => {
  return (
    <OnboardingBlockContainer className={type}>
      <div className="title"></div>
      <div className="message"></div>
    </OnboardingBlockContainer>
  );
};
