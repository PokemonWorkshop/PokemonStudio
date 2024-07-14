import React from 'react';
import styled from 'styled-components';

export const BlockProgressBar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .progress {
    width: 200px;
    -webkit-appearance: none;
    appearance: none;
    border: none;
    border-radius: 10px;
    height: 4px;
  }
  .progress::-webkit-progress-bar {
    background-color: ${({ theme }) => theme.colors.dark20};
  }

  .progress::-webkit-progress-bar,
  .progress::-webkit-progress-value {
    border-radius: 10px;
  }

  .progress::-moz-progress-bar {
    border-radius: 10px;
  }

  .progress::-webkit-progress-value {
    background: ${({ theme }) => theme.colors.primaryBase};
  }

  label {
    color: ${({ theme }) => theme.colors.text400};
    font-size: 14px;
    text-align: end;
    margin-bottom: 4px;
  }
`;

type RenderTextTraduction = {
  value: number;
  maxValue?: number;
  label?: string;
  style?: React.CSSProperties;
};

export const ProgressBar = ({ value, maxValue = 100, label, style }: RenderTextTraduction) => {
  return (
    <BlockProgressBar className="progress-bar" style={style}>
      {label && <label htmlFor="file">{label}</label>}
      <progress id="file" max={maxValue} value={value} className="progress" />
    </BlockProgressBar>
  );
};
