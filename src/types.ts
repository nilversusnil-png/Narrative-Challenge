/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  question: string;
  type: 'Critical' | 'Reflexive' | 'Evocative';
  context: string;
}

export type InputMode = 'url' | 'text';
