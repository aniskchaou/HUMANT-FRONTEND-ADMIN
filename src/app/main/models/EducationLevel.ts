export default class EducationLevel {
  id: number;
  name: string;
  years: string;
  certificateLevel: string;
  fieldofStudy: string;
  school: string;

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
    this.certificateLevel = CertificateLevel;
    this.fieldofStudy = FieldofStudy;
    this.school = School;
  }
}
