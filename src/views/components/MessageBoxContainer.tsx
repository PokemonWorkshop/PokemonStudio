import styled from 'styled-components';
import SvgContainer from './icons/BaseIcon/SvgContainer';

export const MessageBoxContainer = styled.div`
  width: 512px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 8px;
  user-select: none;
`;

export const MessageBoxTitleIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding-top: 8px;

  & > h3 {
    ${({ theme }) => theme.fonts.titlesHeadline6};
    margin: 0;
    line-height: 22px;
    text-align: center;
  }
`;

export const MessageBoxIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 100%;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryBase};

  ${SvgContainer} {
    align-items: center;
    justify-content: center;
  }
`;

export const MessageBoxIconErrorContainer = styled(MessageBoxIconContainer)`
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  color: ${({ theme }) => theme.colors.dangerBase};
`;

export const MessageBoxTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme }) => theme.colors.text400};

  & > p {
    margin: 0;
    text-align: center;
  }

  .red {
    color: ${({ theme }) => theme.colors.dangerBase};
  }
`;

export const MessageBoxActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
`;

export const MessageBoxCancelLink = styled.span`
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme }) => theme.colors.text400};

  :hover {
    cursor: pointer;
  }
`;
