import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

interface DepartementQuality {
  label: string;
  tone: 'strong' | 'medium' | 'warning' | 'critical';
  score: number;
}

interface DepartementView {
  id: number;
  name: string;
  manager: string;
  summary: string;
  staffed: boolean;
  qualityLabel: DepartementQuality['label'];
  qualityTone: DepartementQuality['tone'];
  qualityScore: number;
  employeeCount: number;
  teamCount: number;
  transferCount: number;
}

interface OrgEmployeeView {
  id: number;
  fullName: string;
  departmentId: number | null;
  departmentName: string;
  roleName: string;
  managerId: number | null;
  managerName: string;
}

interface TeamView {
  id: number;
  name: string;
  description: string;
  managerId: number | null;
  managerName: string;
  memberIds: number[];
  memberNames: string[];
  memberCount: number;
  departmentNames: string[];
}

interface TransferView {
  id: number;
  employeeId: number | null;
  employeeName: string;
  fromDepartment: string;
  toDepartment: string;
  designation: string;
  transferDate: string;
  transferDateLabel: string;
}

interface OrgChartNode {
  id: number;
  managerName: string;
  departmentName: string;
  roleName: string;
  reports: OrgEmployeeView[];
  reportCount: number;
}

interface OrgChartTreeNode {
  id: number;
  fullName: string;
  roleName: string;
  departmentName: string;
  managerName: string;
  depth: number;
  directReportCount: number;
  reports: OrgChartTreeNode[];
  teamNames: string[];
}

interface DepartmentAssignmentLane {
  id: number | null;
  name: string;
  manager: string;
  employees: OrgEmployeeView[];
  employeeCount: number;
  summary: string;
  droppable: boolean;
  tone: 'department' | 'unassigned';
}

interface TeamAssignmentLane {
  key: string;
  teamId: number | null;
  title: string;
  managerName: string;
  summary: string;
  employees: OrgEmployeeView[];
}

type DepartementFilter = 'all' | 'staffed' | 'needs-manager';
type DepartementSort = 'quality' | 'name-asc' | 'manager-asc';
type DepartementEditorMode = 'create' | 'edit';

@Component({
  selector: 'app-departement',
  templateUrl: './departement.component.html',
  styleUrls: ['./departement.component.css'],
})
export class DepartementComponent extends URLLoader implements OnInit {
  loading = false;
  saving = false;
  teamSaving = false;
  submitted = false;
  teamSubmitted = false;
  deletingId: number = null;
  deletingTeamId: number = null;
  loadError = '';

  activeFilter: DepartementFilter = 'all';
  activeSort: DepartementSort = 'quality';
  searchTerm = '';

  modalMode: DepartementEditorMode = 'create';
  teamModalMode: DepartementEditorMode = 'create';
  activeDepartementId: number = null;
  activeTeamId: number = null;

  departements: DepartementView[] = [];
  filteredDepartements: DepartementView[] = [];
  featuredDepartement: DepartementView = null;
  employees: OrgEmployeeView[] = [];
  teams: TeamView[] = [];
  transfers: TransferView[] = [];
  orgChartNodes: OrgChartNode[] = [];
  featuredOrgChartRoots: OrgChartTreeNode[] = [];
  departmentAssignmentLanes: DepartmentAssignmentLane[] = [];
  teamAssignmentLanes: TeamAssignmentLane[] = [];

  draggedEmployeeId: number = null;
  reassigningEmployeeId: number = null;

  readonly loadingPlaceholders = [1, 2, 3, 4];
  readonly departementForm: FormGroup;
  readonly teamForm: FormGroup;

  constructor(
    private httpService: HTTPService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.departementForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      manager: ['', [Validators.maxLength(120)]],
    });
    this.teamForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(300)]],
      managerId: [''],
      memberIds: [[]],
    });
  }

  ngOnInit(): void {
    this.loadWorkspace();
    super.loadScripts();
  }

  get totalDepartementsCount(): number {
    return this.departements.length;
  }

  get totalTeamsCount(): number {
    return this.teams.length;
  }

  get staffedDepartementsCount(): number {
    return this.departements.filter((item) => item.staffed).length;
  }

  get needsManagerCount(): number {
    return this.departements.filter((item) => !item.staffed).length;
  }

  get orgLeadsCount(): number {
    return this.orgChartNodes.length;
  }

  get recentTransfersCount(): number {
    return this.transfers.length;
  }

  get managementCoverage(): number {
    return this.toPercent(
      this.staffedDepartementsCount,
      Math.max(this.totalDepartementsCount, 1)
    );
  }

  get filteredResultsLabel(): string {
    const filteredCount = this.formatCount(this.filteredDepartements.length);
    const totalCount = this.formatCount(this.departements.length);

    return this.filteredDepartements.length === this.departements.length
      ? filteredCount + ' departments'
      : filteredCount + ' of ' + totalCount + ' departments';
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Create department' : 'Edit department';
  }

  get modalSubtitle(): string {
    return this.modalMode === 'create'
      ? 'Set up a clean department record, visible ownership, and a reliable org anchor.'
      : 'Refine the department profile and keep leadership accountability current.';
  }

  get teamModalTitle(): string {
    return this.teamModalMode === 'create' ? 'Create team' : 'Edit team';
  }

  get teamModalSubtitle(): string {
    return this.teamModalMode === 'create'
      ? 'Assemble a team, assign the lead, and connect the right members to the structure.'
      : 'Adjust team membership, leadership, and scope without leaving the org workspace.';
  }

  get draftName(): string {
    return this.normalizeText(this.departementForm.value.name) || 'Untitled department';
  }

  get draftManager(): string {
    return this.normalizeText(this.departementForm.value.manager);
  }

  get draftQuality(): DepartementQuality {
    return this.evaluateQuality(this.draftName, this.draftManager, 0, 0);
  }

  get featuredDepartmentEmployees(): OrgEmployeeView[] {
    if (!this.featuredDepartement) {
      return [];
    }

    return this.employees.filter(
      (employee) => employee.departmentId === this.featuredDepartement.id
    );
  }

  get featuredDepartmentTeams(): TeamView[] {
    if (!this.featuredDepartement) {
      return [];
    }

    return this.teams.filter((team) =>
      team.departmentNames.includes(this.featuredDepartement.name)
    );
  }

  get featuredDepartmentTransfers(): TransferView[] {
    if (!this.featuredDepartement) {
      return [];
    }

    return this.transfers.filter(
      (transfer) =>
        transfer.fromDepartment === this.featuredDepartement.name ||
        transfer.toDepartment === this.featuredDepartement.name
    );
  }

  get featuredOrgNodes(): OrgChartNode[] {
    if (!this.featuredDepartement) {
      return [];
    }

    return this.orgChartNodes.filter(
      (node) =>
        node.departmentName === this.featuredDepartement.name ||
        node.reports.some(
          (report) => report.departmentName === this.featuredDepartement.name
        )
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetEditor();
  }

  openEditModal(item: DepartementView): void {
    this.modalMode = 'edit';
    this.activeDepartementId = item.id;
    this.submitted = false;
    this.featuredDepartement = item;
    this.refreshOrganizationViews();
    this.departementForm.reset({
      name: item.name,
      manager: item.manager,
    });
  }

  openTeamCreateModal(): void {
    this.teamModalMode = 'create';
    this.resetTeamEditor();
  }

  openTeamEditModal(team: TeamView): void {
    this.teamModalMode = 'edit';
    this.activeTeamId = team.id;
    this.teamSubmitted = false;
    this.teamForm.reset({
      name: team.name,
      description: team.description,
      managerId: team.managerId || '',
      memberIds: team.memberIds.map((id) => String(id)),
    });
  }

  selectDepartement(item: DepartementView): void {
    this.featuredDepartement = item;
    this.refreshOrganizationViews();
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onFilterChange(value: DepartementFilter): void {
    this.activeFilter = value || 'all';
    this.applyFilters();
  }

  onSortChange(value: DepartementSort): void {
    this.activeSort = value || 'quality';
    this.applyFilters();
  }

  refreshDepartements(): void {
    this.loadWorkspace(true);
  }

  trackByDepartementId(index: number, item: DepartementView): number {
    return item.id || index;
  }

  trackByTeamId(index: number, team: TeamView): number {
    return team.id || index;
  }

  trackByOrgNodeId(index: number, node: OrgChartNode): number {
    return node.id || index;
  }

  trackByEmployeeId(index: number, item: OrgEmployeeView): number {
    return item.id || index;
  }

  trackByOrgTreeNodeId(index: number, node: OrgChartTreeNode): number {
    return node.id || index;
  }

  trackByDepartmentLaneId(index: number, lane: DepartmentAssignmentLane): number | string {
    return lane.id === null ? 'unassigned' : lane.id;
  }

  trackByTeamLaneId(index: number, lane: TeamAssignmentLane): string {
    return lane.key;
  }

  onEmployeeDragStart(event: DragEvent, employee: OrgEmployeeView): void {
    this.draggedEmployeeId = employee.id;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(employee.id));
    }
  }

  onEmployeeDragEnd(): void {
    this.clearDragState();
  }

  allowEmployeeDrop(event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  async onDepartmentDrop(
    event: DragEvent,
    lane: DepartmentAssignmentLane
  ): Promise<void> {
    event.preventDefault();

    const employee = this.getDraggedEmployee();
    if (!employee || !lane.droppable || lane.id === null) {
      this.clearDragState();
      return;
    }

    if (employee.departmentId === lane.id) {
      this.clearDragState();
      return;
    }

    this.reassigningEmployeeId = employee.id;

    try {
      await this.createDepartmentTransfer(employee, lane.id);
      super.show(
        'Confirmation',
        employee.fullName +
          ' moved to ' +
          lane.name +
          '. The transfer was recorded and the employee profile was synced.',
        'success'
      );
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.reassigningEmployeeId = null;
      this.clearDragState();
    }
  }

  async onTeamLaneDrop(
    event: DragEvent,
    lane: TeamAssignmentLane
  ): Promise<void> {
    event.preventDefault();

    const employee = this.getDraggedEmployee();
    if (!employee || !this.featuredDepartement) {
      this.clearDragState();
      return;
    }

    if (employee.departmentId !== this.featuredDepartement.id) {
      this.clearDragState();
      super.show(
        'Error',
        'Select the employee\'s current department before changing team assignment.',
        'warning'
      );
      return;
    }

    this.reassigningEmployeeId = employee.id;

    try {
      const changed = await this.reassignEmployeeTeam(employee, lane.teamId);

      if (changed) {
        super.show(
          'Confirmation',
          lane.teamId === null
            ? employee.fullName +
              ' is now unassigned inside ' +
              this.featuredDepartement.name +
              '.'
            : employee.fullName + ' reassigned to ' + lane.title + '.',
          'success'
        );
        this.loadWorkspace();
      }
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.reassigningEmployeeId = null;
      this.clearDragState();
    }
  }

  async saveDepartement(): Promise<void> {
    this.submitted = true;

    const payload = this.buildPayload();
    if (!payload) {
      this.departementForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      if (this.modalMode === 'edit' && this.activeDepartementId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/departement/update/' + this.activeDepartementId,
          payload
        );
        super.show('Confirmation', 'Department updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/departement/create', payload);
        super.show('Confirmation', 'Department created successfully.', 'success');
      }

      this.closeCrudModal();
      this.resetEditor();
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.saving = false;
    }
  }

  async saveTeam(): Promise<void> {
    this.teamSubmitted = true;

    const payload = this.buildTeamPayload();
    if (!payload) {
      this.teamForm.markAllAsTouched();
      return;
    }

    this.teamSaving = true;

    try {
      if (this.teamModalMode === 'edit' && this.activeTeamId !== null) {
        await this.httpService.update(
          CONFIG.URL_BASE + '/api/teams/' + this.activeTeamId,
          payload
        );
        super.show('Confirmation', 'Team updated successfully.', 'success');
      } else {
        await this.httpService.create(CONFIG.URL_BASE + '/api/teams', payload);
        super.show('Confirmation', 'Team created successfully.', 'success');
      }

      this.closeTeamCrudModal();
      this.resetTeamEditor();
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.teamSaving = false;
    }
  }

  async deleteDepartement(item: DepartementView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + item.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId = item.id;

    try {
      await this.httpService.remove(
        CONFIG.URL_BASE + '/departement/delete/' + item.id
      );
      super.show('Confirmation', 'Department deleted successfully.', 'success');

      if (this.featuredDepartement && this.featuredDepartement.id === item.id) {
        this.featuredDepartement = null;
      }

      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingId = null;
    }
  }

  async deleteTeam(team: TeamView): Promise<void> {
    const confirmed = confirm(
      'Delete "' + team.name + '"? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingTeamId = team.id;

    try {
      await this.httpService.remove(CONFIG.URL_BASE + '/api/teams/' + team.id);
      super.show('Confirmation', 'Team deleted successfully.', 'success');
      this.loadWorkspace();
    } catch (error) {
      super.show('Error', this.getErrorMessage(error), 'warning');
    } finally {
      this.deletingTeamId = null;
    }
  }

  private loadWorkspace(showNotification = false): void {
    this.loading = true;
    this.loadError = '';

    forkJoin({
      departements: this.httpService.getAll(CONFIG.URL_BASE + '/departement/all'),
      employees: this.httpService
        .getAll(CONFIG.URL_BASE + '/employee/all')
        .pipe(catchError(() => of([]))),
      teams: this.httpService
        .getAll(CONFIG.URL_BASE + '/api/teams')
        .pipe(catchError(() => of([]))),
      transfers: this.httpService
        .getAll(CONFIG.URL_BASE + '/transfer/all')
        .pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (result) => {
          this.employees = this.normalizeEmployees(result.employees);
          this.teams = this.normalizeTeams(result.teams);
          this.transfers = this.normalizeTransfers(result.transfers);
          this.orgChartNodes = this.buildOrgChartNodes(this.employees);
          this.departements = this.normalizeDepartements(result.departements);
          this.applyFilters();

          if (showNotification) {
            super.show('Confirmation', 'Departments refreshed successfully.', 'success');
          }
        },
        (err: HttpErrorResponse) => {
          this.departements = [];
          this.filteredDepartements = [];
          this.featuredDepartement = null;
          this.employees = [];
          this.teams = [];
          this.transfers = [];
          this.orgChartNodes = [];
          this.featuredOrgChartRoots = [];
          this.departmentAssignmentLanes = [];
          this.teamAssignmentLanes = [];
          this.loadError = 'Unable to load organization records from the backend right now.';
          super.show('Error', err.message, 'warning');
        }
      );
  }

  private resetEditor(): void {
    this.activeDepartementId = null;
    this.submitted = false;
    this.saving = false;
    this.departementForm.reset({
      name: '',
      manager: '',
    });
  }

  private resetTeamEditor(): void {
    this.activeTeamId = null;
    this.teamSubmitted = false;
    this.teamSaving = false;
    this.teamForm.reset({
      name: '',
      description: '',
      managerId: '',
      memberIds: [],
    });
  }

  private applyFilters(): void {
    const searchValue = this.searchTerm.trim().toLowerCase();

    this.filteredDepartements = this.departements
      .filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.name.toLowerCase().includes(searchValue) ||
          item.manager.toLowerCase().includes(searchValue);

        const matchesFilter =
          this.activeFilter === 'all'
            ? true
            : this.activeFilter === 'staffed'
            ? item.staffed
            : !item.staffed;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        if (this.activeSort === 'name-asc') {
          return left.name.localeCompare(right.name);
        }

        if (this.activeSort === 'manager-asc') {
          return left.manager.localeCompare(right.manager);
        }

        const qualityDifference = right.qualityScore - left.qualityScore;
        return qualityDifference !== 0
          ? qualityDifference
          : left.name.localeCompare(right.name);
      });

    if (!this.filteredDepartements.length) {
      this.featuredDepartement = null;
      this.refreshOrganizationViews();
      return;
    }

    if (
      !this.featuredDepartement ||
      !this.filteredDepartements.some(
        (item) => item.id === this.featuredDepartement.id
      )
    ) {
      this.featuredDepartement = this.filteredDepartements[0];
    }

    this.refreshOrganizationViews();
  }

  private refreshOrganizationViews(): void {
    this.departmentAssignmentLanes = this.buildDepartmentAssignmentLanes();
    this.featuredOrgChartRoots = this.buildDepartmentOrgChartRoots(
      this.featuredDepartmentEmployees
    );
    this.teamAssignmentLanes = this.buildTeamAssignmentLanes();
  }

  private normalizeDepartements(data: unknown): DepartementView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((record) => this.normalizeText(record && record.name).length > 0)
      .map((record, index) => this.toDepartementView(record, index));
  }

  private normalizeEmployees(data: unknown): OrgEmployeeView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => ({
        id: this.normalizeNumericId(item && item.id) || index + 1,
        fullName: this.normalizeText(item && item.fullName) || 'Unnamed employee',
        departmentId: this.normalizeNumericId(item && item.department && item.department.id),
        departmentName:
          this.normalizeText(item && item.department && item.department.name) ||
          'Unassigned',
        roleName:
          this.normalizeText(item && item.role && item.role.name) ||
          this.normalizeText(item && item.job && item.job.name) ||
          'Role pending',
        managerId: this.normalizeNumericId(item && item.manager && item.manager.id),
        managerName: this.normalizeText(item && item.manager && item.manager.fullName),
      }))
      .filter((item) => !!item.fullName);
  }

  private normalizeTeams(data: unknown): TeamView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => {
        const members = Array.isArray(item && item.members) ? item.members : [];
        const managerId = this.normalizeNumericId(item && item.manager && item.manager.id);
        const memberIds = members
          .map((member) => this.normalizeNumericId(member && member.id))
          .filter((id): id is number => !!id);
        const linkedEmployeeIds = [managerId, ...memberIds].filter(
          (id): id is number => !!id
        );
        const departmentNames = Array.from(
          new Set(
            linkedEmployeeIds
              .map((id) => this.lookupEmployeeDepartmentName(id))
              .filter((name) => !!name && name !== 'Unassigned')
          )
        );

        return {
          id: this.normalizeNumericId(item && item.id) || index + 1,
          name: this.normalizeText(item && item.name) || 'Untitled team',
          description: this.normalizeText(item && item.description),
          managerId,
          managerName:
            this.lookupEmployeeName(managerId) ||
            this.normalizeText(item && item.manager && item.manager.fullName),
          memberIds,
          memberNames: memberIds
            .map((id) => this.lookupEmployeeName(id))
            .filter(Boolean),
          memberCount: members.length,
          departmentNames,
        };
      })
      .filter((item) => !!item.name);
  }

  private normalizeTransfers(data: unknown): TransferView[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => {
        const transferDate = this.normalizeDateString(item && item.transferDate);

        return {
          id: this.normalizeNumericId(item && item.id) || index + 1,
          employeeId: this.normalizeNumericId(
            item && item.employeeName && item.employeeName.id
          ),
          employeeName:
            this.normalizeText(item && item.employeeName && item.employeeName.fullName) ||
            'Employee',
          fromDepartment: this.normalizeText(
            item && item.departementFrom && item.departementFrom.name
          ),
          toDepartment: this.normalizeText(
            item && item.departementTo && item.departementTo.name
          ),
          designation: this.normalizeText(item && item.designation),
          transferDate,
          transferDateLabel: this.formatDateLabel(transferDate, 'Transfer date not set'),
        };
      })
      .sort((left, right) => right.transferDate.localeCompare(left.transferDate));
  }

  private buildOrgChartNodes(employees: OrgEmployeeView[]): OrgChartNode[] {
    return employees
      .filter((employee) => employees.some((item) => item.managerId === employee.id))
      .map((employee) => {
        const reports = employees.filter((item) => item.managerId === employee.id);

        return {
          id: employee.id,
          managerName: employee.fullName,
          departmentName: employee.departmentName,
          roleName: employee.roleName,
          reports,
          reportCount: reports.length,
        };
      })
      .sort((left, right) => right.reportCount - left.reportCount);
  }

  private buildDepartmentOrgChartRoots(
    employees: OrgEmployeeView[]
  ): OrgChartTreeNode[] {
    if (!employees.length) {
      return [];
    }

    const employeeIds = new Set(employees.map((employee) => employee.id));
    const childMap = new Map<number, OrgEmployeeView[]>();
    const rootEmployees: OrgEmployeeView[] = [];

    employees.forEach((employee) => {
      if (employee.managerId && employeeIds.has(employee.managerId)) {
        const reports = childMap.get(employee.managerId) || [];
        reports.push(employee);
        childMap.set(employee.managerId, reports);
        return;
      }

      rootEmployees.push(employee);
    });

    const visited = new Set<number>();
    const roots = this.sortEmployees(rootEmployees).map((employee) =>
      this.buildDepartmentOrgChartNode(employee, childMap, 0, visited, new Set<number>())
    );

    this.sortEmployees(employees)
      .filter((employee) => !visited.has(employee.id))
      .forEach((employee) => {
        roots.push(
          this.buildDepartmentOrgChartNode(
            employee,
            childMap,
            0,
            visited,
            new Set<number>()
          )
        );
      });

    return roots;
  }

  private buildDepartmentOrgChartNode(
    employee: OrgEmployeeView,
    childMap: Map<number, OrgEmployeeView[]>,
    depth: number,
    visited: Set<number>,
    lineage: Set<number>
  ): OrgChartTreeNode {
    visited.add(employee.id);
    const nextLineage = new Set(lineage);
    nextLineage.add(employee.id);

    const reports = this.sortEmployees(childMap.get(employee.id) || [])
      .filter((report) => !nextLineage.has(report.id))
      .map((report) =>
        this.buildDepartmentOrgChartNode(
          report,
          childMap,
          depth + 1,
          visited,
          nextLineage
        )
      );

    return {
      id: employee.id,
      fullName: employee.fullName,
      roleName: employee.roleName,
      departmentName: employee.departmentName,
      managerName: employee.managerName,
      depth,
      directReportCount: reports.length,
      reports,
      teamNames: this.lookupEmployeeTeamNames(employee.id),
    };
  }

  private buildDepartmentAssignmentLanes(): DepartmentAssignmentLane[] {
    const lanes: DepartmentAssignmentLane[] = [];
    const unassignedEmployees = this.sortEmployees(
      this.employees.filter((employee) => !employee.departmentId)
    );

    lanes.push({
      id: null,
      name: 'Unassigned employees',
      manager: '',
      employees: unassignedEmployees,
      employeeCount: unassignedEmployees.length,
      summary:
        'Use this source lane to place employees into a department. Dropping back here is intentionally disabled.',
      droppable: false,
      tone: 'unassigned',
    });

    this.departements
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .forEach((departement) => {
        const laneEmployees = this.sortEmployees(
          this.employees.filter((employee) => employee.departmentId === departement.id)
        );

        lanes.push({
          id: departement.id,
          name: departement.name,
          manager: departement.manager,
          employees: laneEmployees,
          employeeCount: laneEmployees.length,
          summary:
            'Drop an employee here to create an immediate transfer and sync the employee profile to ' +
            departement.name +
            '.',
          droppable: true,
          tone: 'department',
        });
      });

    return lanes;
  }

  private buildTeamAssignmentLanes(): TeamAssignmentLane[] {
    if (!this.featuredDepartement) {
      return [];
    }

    const departmentEmployees = this.sortEmployees(this.featuredDepartmentEmployees);
    const departmentTeams = this.featuredDepartmentTeams
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name));
    const primaryTeamIds = new Map<number, number | null>();

    departmentEmployees.forEach((employee) => {
      const matchingTeam = departmentTeams.find((team) =>
        team.memberIds.includes(employee.id)
      );
      primaryTeamIds.set(employee.id, matchingTeam ? matchingTeam.id : null);
    });

    const lanes: TeamAssignmentLane[] = [
      {
        key: 'team-unassigned',
        teamId: null,
        title: 'Unassigned inside ' + this.featuredDepartement.name,
        managerName: '',
        summary:
          'Drop employees here to remove them from the active team lanes for this department.',
        employees: departmentEmployees.filter(
          (employee) => primaryTeamIds.get(employee.id) === null
        ),
      },
    ];

    departmentTeams.forEach((team) => {
      lanes.push({
        key: 'team-' + team.id,
        teamId: team.id,
        title: team.name,
        managerName: team.managerName,
        summary:
          team.description ||
          'Drop employees here to make ' + team.name + ' their active team lane.',
        employees: departmentEmployees.filter(
          (employee) => primaryTeamIds.get(employee.id) === team.id
        ),
      });
    });

    return lanes;
  }

  private toDepartementView(record: any, index: number): DepartementView {
    const name = this.normalizeText(record && record.name) || 'Untitled department';
    const manager = this.normalizeText(record && record.manager);
    const numericId = Number(record && record.id);
    const departementId = Number.isFinite(numericId) ? numericId : index + 1;
    const employeeCount = this.employees.filter(
      (employee) => employee.departmentId === departementId
    ).length;
    const teamCount = this.teams.filter((team) => team.departmentNames.includes(name)).length;
    const transferCount = this.transfers.filter(
      (transfer) => transfer.fromDepartment === name || transfer.toDepartment === name
    ).length;
    const quality = this.evaluateQuality(name, manager, employeeCount, teamCount);

    return {
      id: departementId,
      name,
      manager,
      summary: manager
        ? employeeCount +
          ' employee' +
          (employeeCount === 1 ? '' : 's') +
          ', ' +
          teamCount +
          ' team' +
          (teamCount === 1 ? '' : 's') +
          ', and clear ownership under ' +
          manager +
          '.'
        : 'No manager is assigned yet. Add ownership so transfers, reporting lines, and team planning stay operationally ready.',
      staffed: manager.length > 0,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualityScore: quality.score,
      employeeCount,
      teamCount,
      transferCount,
    };
  }

  private evaluateQuality(
    name: string,
    manager: string,
    employeeCount: number,
    teamCount: number
  ): DepartementQuality {
    const signals = [!!name, !!manager, employeeCount > 0, teamCount > 0].filter(Boolean)
      .length;
    const score = Math.round((signals / 4) * 100);

    if (score >= 100) {
      return {
        label: 'Structured',
        tone: 'strong',
        score,
      };
    }

    if (score >= 75) {
      return {
        label: 'Solid',
        tone: 'medium',
        score,
      };
    }

    if (score > 0) {
      return {
        label: 'Needs owner',
        tone: 'warning',
        score: Math.max(score, 36),
      };
    }

    return {
      label: 'Incomplete',
      tone: 'critical',
      score: 12,
    };
  }

  private buildPayload(): { name: string; manager: string } | null {
    const name = this.normalizeText(this.departementForm.value.name);
    const manager = this.normalizeText(this.departementForm.value.manager);

    this.departementForm.patchValue(
      {
        name,
        manager,
      },
      { emitEvent: false }
    );

    if (!name) {
      this.departementForm.get('name').setErrors({ required: true });
      return null;
    }

    if (this.departementForm.invalid) {
      return null;
    }

    return {
      name,
      manager,
    };
  }

  private buildTeamPayload(): any | null {
    const name = this.normalizeText(this.teamForm.value.name);
    const description = this.normalizeText(this.teamForm.value.description);
    const managerId = this.normalizeNumericId(this.teamForm.value.managerId);
    const memberIds = this.resolveSelectedMemberIds(this.teamForm.value.memberIds);

    this.teamForm.patchValue(
      {
        name,
        description,
        managerId: managerId || '',
        memberIds: memberIds.map((id) => String(id)),
      },
      { emitEvent: false }
    );

    if (!name) {
      this.teamForm.get('name').setErrors({ required: true });
      return null;
    }

    if (this.teamForm.invalid) {
      return null;
    }

    return {
      name,
      description,
      manager: managerId ? { id: managerId } : null,
      members: memberIds.map((id) => ({ id })),
    };
  }

  private resolveSelectedMemberIds(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((entry) => this.normalizeNumericId(entry))
      .filter((entry): entry is number => !!entry);
  }

  private buildTeamUpdatePayload(team: TeamView, memberIds: number[]): any {
    return {
      name: team.name,
      description: team.description,
      manager: team.managerId ? { id: team.managerId } : null,
      members: Array.from(new Set(memberIds))
        .sort((left, right) => left - right)
        .map((id) => ({ id })),
    };
  }

  private getDraggedEmployee(): OrgEmployeeView | null {
    if (this.draggedEmployeeId === null) {
      return null;
    }

    return this.lookupEmployeeById(this.draggedEmployeeId);
  }

  private async createDepartmentTransfer(
    employee: OrgEmployeeView,
    targetDepartementId: number
  ): Promise<void> {
    const today = this.getCurrentDateString();

    await this.httpService.create(CONFIG.URL_BASE + '/transfer/create', {
      employeeName: { id: employee.id },
      departementFrom: employee.departmentId ? { id: employee.departmentId } : null,
      departementTo: { id: targetDepartementId },
      designation: employee.roleName === 'Role pending' ? '' : employee.roleName,
      noticeDate: today,
      transferDate: today,
      description:
        'Created from the organization workspace drag-and-drop department reassignment board.',
    });
  }

  private async reassignEmployeeTeam(
    employee: OrgEmployeeView,
    targetTeamId: number | null
  ): Promise<boolean> {
    const currentTeamIds = Array.from(
      new Set(
        this.featuredDepartmentTeams
          .filter((team) => team.memberIds.includes(employee.id))
          .map((team) => team.id)
      )
    );

    const teamIdsToRemove = currentTeamIds.filter((teamId) => teamId !== targetTeamId);
    const needsTargetAdd =
      targetTeamId !== null && !currentTeamIds.includes(targetTeamId);

    if (
      !teamIdsToRemove.length &&
      !needsTargetAdd &&
      !(targetTeamId === null && currentTeamIds.length)
    ) {
      return false;
    }

    for (const teamId of teamIdsToRemove) {
      const team = this.getTeamById(teamId);

      if (!team) {
        continue;
      }

      await this.updateTeamMembers(
        team,
        team.memberIds.filter((memberId) => memberId !== employee.id)
      );
    }

    if (targetTeamId !== null) {
      const targetTeam = this.getTeamById(targetTeamId);

      if (targetTeam) {
        await this.updateTeamMembers(targetTeam, [...targetTeam.memberIds, employee.id]);
      }
    }

    return true;
  }

  private async updateTeamMembers(
    team: TeamView,
    memberIds: number[]
  ): Promise<void> {
    await this.httpService.update(
      CONFIG.URL_BASE + '/api/teams/' + team.id,
      this.buildTeamUpdatePayload(team, memberIds)
    );
  }

  private closeCrudModal(): void {
    const closeButton = document.getElementById('departementCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private closeTeamCrudModal(): void {
    const closeButton = document.getElementById('teamCrudModalClose');

    if (closeButton) {
      (closeButton as HTMLElement).click();
    }
  }

  private normalizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeDateString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private normalizeNumericId(value: unknown): number | null {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
  }

  private lookupEmployeeById(id: number | null): OrgEmployeeView | null {
    if (!id) {
      return null;
    }

    return this.employees.find((employee) => employee.id === id) || null;
  }

  private lookupEmployeeName(id: number | null): string {
    const employee = this.lookupEmployeeById(id);
    return employee ? employee.fullName : '';
  }

  private lookupEmployeeDepartmentName(id: number | null): string {
    const employee = this.lookupEmployeeById(id);
    return employee ? employee.departmentName : '';
  }

  private lookupEmployeeTeamNames(employeeId: number): string[] {
    return this.teams
      .filter(
        (team) => team.managerId === employeeId || team.memberIds.includes(employeeId)
      )
      .map((team) => team.name)
      .filter(Boolean);
  }

  private getTeamById(id: number | null): TeamView | null {
    if (!id) {
      return null;
    }

    return this.teams.find((team) => team.id === id) || null;
  }

  private sortEmployees(employees: OrgEmployeeView[]): OrgEmployeeView[] {
    return employees
      .slice()
      .sort((left, right) => left.fullName.localeCompare(right.fullName));
  }

  private getCurrentDateString(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
  }

  private clearDragState(): void {
    this.draggedEmployeeId = null;
  }

  private formatDateLabel(value: string, fallback: string): string {
    if (!value) {
      return fallback;
    }

    const parsedDate = new Date(value.length === 10 ? value + 'T00:00:00' : value);

    if (Number.isNaN(parsedDate.getTime())) {
      return fallback;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }

    return 'Unable to complete the organization request right now.';
  }

  private toPercent(value: number, total: number): number {
    if (!total) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}
