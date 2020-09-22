import React, { Component } from 'react';
import Layout from '../components/layout/layout';

class AnimatedCard extends Component {
  render() {
    return (
      <Layout>
        <div className="merchants-form__fields">
          <h1 className="example-form__title">
            <img style={{ maxWidth: '200px' }} src="./images/st.png" />
          </h1>
          <div className="merchants-form__field">
            <label htmlFor="st-card-number-input">Card number: </label>
            <input
              type="text"
              className="merchants-form__input"
              id="st-card-number-input"
              name="st-card-number-input"
            />
            <div className="merchants-form__error" id="st-card-number-message" />
          </div>

          <div className="merchants-form__field">
            <label htmlFor="st-expiration-date-input">Expiration date: </label>
            <input
              type="text"
              className="merchants-form__input"
              id="st-expiration-date-input"
              name="st-expiration-date-input"
            />
            <div className="merchants-form__error" id="st-expiration-date-message" />
          </div>

          <div className="merchants-form__field">
            <label htmlFor="st-security-code-input">Security code: </label>
            <input
              type="text"
              className="merchants-form__input"
              id="st-security-code-input"
              name="st-security-code-input"
            />
            <div className="merchants-form__error" id="st-security-code-message" />
          </div>
        </div>

        <div id="st-animated-card" className="st-animated-card-wrapper" />
      </Layout>
    );
  }
}

export default AnimatedCard;
