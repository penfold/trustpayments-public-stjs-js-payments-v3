import React from 'react';
import { Link } from 'gatsby';
import { NavigationLinkStyles } from './navigation.styled';

export const Navigation = () => (
  <ul className="navigation">
    <Link to="/" style={NavigationLinkStyles}>
      Home
    </Link>
    <Link to="/payment-details" style={NavigationLinkStyles}>
      Payment Details
    </Link>
    <Link to="/personal-data" style={NavigationLinkStyles}>
      Personal Data
    </Link>
    <Link to="/contact-data" style={NavigationLinkStyles}>
      Contact Data
    </Link>
    <Link to="/" style={NavigationLinkStyles}>
      Payment
    </Link>
  </ul>
);
