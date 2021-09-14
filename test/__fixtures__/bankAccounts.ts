import customersFixtures from "./customers";

export default [
  {
    id: 1,
    balance: 123,
    customer: {
      id: customersFixtures[0].id,
    },
    iban: "AD9530364361S07G1RPUIXUR",
  },
  {
    id: 2,
    balance: 123,
    customer: {
      id: customersFixtures[1].id,
    },
    iban: "GB32KLCH45554810900769",
  },
];
