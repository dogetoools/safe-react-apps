import styled from 'styled-components'

const FormContainer = styled.form`
  margin-bottom: 2rem;
  max-width: 800px;
  padding: 30px;

  @media only screen and (max-width: 768px) {
    padding: 0px;
    padding-left: 1px;
  }

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`

export default FormContainer
