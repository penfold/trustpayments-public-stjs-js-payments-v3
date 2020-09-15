import React from 'react';

export const Header = props => {
  return (
    <header className="st-header">
      <figure className="st-header__logo">
        <img src={props.logo} alt="Secure Trading logo" title="Secure Trading" role="img" />
      </figure>
      <h1 className="st-header__title">{props.title}</h1>
    </header>
  );
};
