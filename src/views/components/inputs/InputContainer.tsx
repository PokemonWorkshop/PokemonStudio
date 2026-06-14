import styled from 'styled-components';

type SizeType = 'xxs' | 'xs' | 's' | 'm' | 'l';
type InputContainerProps = { size?: SizeType };

const sizes: Record<SizeType, string> = {
  xxs: '8px',
  xs: '12px',
  s: '16px',
  m: '24px',
  l: '32px',
};

export const InputContainer = styled.div<InputContainerProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ size }) => (size ? sizes[size] : '24px')};
`;

export const InputFormContainer = styled.form<InputContainerProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ size }) => (size ? sizes[size] : '24px')};
`;

export const PaddedInputContainer = styled(InputContainer)`
  padding: 0 10px;
`;
