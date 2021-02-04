/**
 * Styled component used for setting the size of the inline svgs
 * @param size px size of the div
 */
import Styled from 'styled-components';

const SvgContainer = Styled.div<{ size: string }>`
 display: flex;
 width: ${(props) => props.size};
 height: ${(props) => props.size};
`;

export default SvgContainer;
