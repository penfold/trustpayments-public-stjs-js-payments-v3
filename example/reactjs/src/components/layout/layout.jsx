import React from 'react';
import '../../style.css';
import '../../example.css';
import { Footer } from '../footer/footer';
import { LayoutStyled } from './layout.styled';
import { Navigation } from '../navigation/navigation';

const Layout = props => {
  return (
    <LayoutStyled>
      <Navigation siteTitle="SecureTrading" />
      <main style={{ minHeight: '90vh' }}>
        <form role="form" name="st-form" id="st-form" className="st-form" autoComplete="off" noValidate>
          <div id="st-popup" className="st-popup" />
          <div id="st-notification-frame" className="st-form__group st-notifications" />
          {props.children}
        </form>
      </main>
      <Footer />
    </LayoutStyled>
  );
};

export default Layout;
