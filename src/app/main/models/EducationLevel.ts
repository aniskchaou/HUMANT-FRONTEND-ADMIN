export default class EducationLevel {
  id: number;
  name: string;
  years: string;
  CertificateLevel: string;
  FieldofStudy: string;
  School: string;

  constructor(
    id: number,
    name: string,
    years: string,
    CertificateLevel: string,
    FieldofStudy: string,
    School: string
  ) {
    this.id = id;
    this.name = name;
    this.years = years;
    this.CertificateLevel = CertificateLevel;
    this.FieldofStudy = FieldofStudy;
    this.School = School;
  }
}
