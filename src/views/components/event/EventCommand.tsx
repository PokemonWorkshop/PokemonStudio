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

  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.05) 100%), rgb(37, 38, 42);
  background-blend-mode: overlay, normal;
  border: 0.5px solid rgb(46, 48, 54);
  box-shadow: 0px 1px 1px -0.5px rgba(0, 0, 0, 0.05), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.05);
  border-radius: 8px;

  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .command-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .helper-icon {
    }
  }

  .title {
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text100};
  }
`;

type EventCommandProps = {
  title: string;
};

export const EventCommand = ({ title }: EventCommandProps) => {
  return (
    <EventCommandContainer>
      <div className="header">
        <span className="command-icon">CI</span>
        <span className="helper-icon">HI</span>
      </div>
      <span className="title">{title}</span>
    </EventCommandContainer>
  );
};
