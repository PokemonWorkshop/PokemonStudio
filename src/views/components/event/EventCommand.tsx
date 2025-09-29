import React from 'react';
import styled from 'styled-components';

const EventCommandContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 8px;
  gap: 8px;
  height: 100px;
  justify-content: space-between;
  cursor: pointer;

  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.05) 100%), rgb(39, 27, 53);
  background-blend-mode: overlay, normal;
  border: 0.5px solid rgb(58, 36, 80);
  box-shadow: 0px 1px 1px -0.5px rgba(0, 0, 0, 0.05), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.05);
  border-radius: 8px;

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline6}
    color: ${({ theme }) => theme.colors.text100};
    text-align: center;
  }
`;

type CommandProps = {
  title: string;
};

export const EventCommand = ({ title }: CommandProps) => {
  return (
    <EventCommandContainer>
      <span className="icon">Icon</span>
      <span className="title">{title}</span>
    </EventCommandContainer>
  );
};
