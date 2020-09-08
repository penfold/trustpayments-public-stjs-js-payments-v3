import styled from 'styled-components';

const NavigationStyled = styled.header`
  padding: 0 4rem;
  background-color: #e61c5b;
  color: #fff;
  min-height: 5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const NavigationLinkStyles = { color: '#fff', textDecoration: 'none', padding: '1rem 2rem' };

export { NavigationLinkStyles, NavigationStyled };
