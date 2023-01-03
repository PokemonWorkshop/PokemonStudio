import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { Input } from './Input';
import { ReactComponent as OffsetIcon } from '@assets/icons/global/offset-icon.svg';
import { StudioMapLinkCardinal } from '@modelEntities/mapLink';

const InputOffsetContainer = styled.div`
  position: relative;

  & .icon {
    position: absolute;
    top: 7px;
    left: 8px;
    color: ${({ theme }) => theme.colors.text600};
    cursor: default;
  }

  &[data-type='east'] {
    & .icon {
      transform: rotate(90deg);
    }
  }

  &[data-type='south'] {
    & .icon {
      transform: rotate(180deg);
    }
  }

  &[data-type='west'] {
    & .icon {
      transform: rotate(-90deg);
    }
  }

  ${Input} {
    height: 26px;
    width: 64px;
    padding: 5px 8px 5px 28px;
    ${({ theme }) => theme.fonts.normalSmall};

    :hover {
      padding: 4px 7px 4px 27px;
    }

    .active,
    :active,
    :focus {
      padding: 4px 7px 4px 27px;
    }
  }
`;

type InputOffsetProps = {
  cardinal: StudioMapLinkCardinal;
} & InputHTMLAttributes<HTMLInputElement>;

export const InputOffset = ({ cardinal, ...props }: InputOffsetProps) => (
  <InputOffsetContainer data-type={cardinal} onClick={(event) => event.stopPropagation()}>
    <OffsetIcon className="icon" />
    <Input {...props} />
  </InputOffsetContainer>
);
