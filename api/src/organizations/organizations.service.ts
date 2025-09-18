import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  /**
   * Get all descendant organizations of a given organization
   * This includes the organization itself and all its children, grandchildren, etc.
   */
  async getDescendantOrganizations(orgId: string): Promise<string[]> {
    const descendants = new Set<string>();
    const queue = [orgId];

    while (queue.length > 0) {
      const currentOrgId = queue.shift();
      if (!currentOrgId) continue;

      descendants.add(currentOrgId);

      // Find all direct children of the current organization
      const children = await this.organizationsRepository.find({
        where: { parentId: currentOrgId, isActive: true },
        select: ['id']
      });

      // Add children to queue for further processing
      children.forEach(child => {
        if (!descendants.has(child.id)) {
          queue.push(child.id);
        }
      });
    }

    return Array.from(descendants);
  }

  /**
   * Get all ancestor organizations of a given organization
   * This includes the organization itself and all its parents, grandparents, etc.
   */
  async getAncestorOrganizations(orgId: string): Promise<string[]> {
    const ancestors = new Set<string>();
    let currentOrgId = orgId;

    while (currentOrgId) {
      ancestors.add(currentOrgId);

      const org = await this.organizationsRepository.findOne({
        where: { id: currentOrgId, isActive: true },
        select: ['parentId']
      });

      if (!org || !org.parentId) break;
      currentOrgId = org.parentId;
    }

    return Array.from(ancestors);
  }

  /**
   * Check if one organization is a descendant of another
   */
  async isDescendantOf(descendantOrgId: string, ancestorOrgId: string): Promise<boolean> {
    const ancestors = await this.getAncestorOrganizations(descendantOrgId);
    return ancestors.includes(ancestorOrgId);
  }

  /**
   * Check if one organization is an ancestor of another
   */
  async isAncestorOf(ancestorOrgId: string, descendantOrgId: string): Promise<boolean> {
    const descendants = await this.getDescendantOrganizations(ancestorOrgId);
    return descendants.includes(descendantOrgId);
  }

  /**
   * Get the root organization (top-level parent) of an organization
   */
  async getRootOrganization(orgId: string): Promise<string | null> {
    const ancestors = await this.getAncestorOrganizations(orgId);
    return ancestors[ancestors.length - 1] || null;
  }

  /**
   * Get organization hierarchy level
   */
  async getOrganizationLevel(orgId: string): Promise<number> {
    const org = await this.organizationsRepository.findOne({
      where: { id: orgId, isActive: true },
      select: ['level']
    });
    return org?.level || 0;
  }
}
