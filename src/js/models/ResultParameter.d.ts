import ResultParameterBase from './base/ResultParameterBase';

/**
 * @class ResultParameter
 * @extends ResultParameterBase
 */
declare class ResultParameter extends ResultParameterBase {
  static create(data: {
    resultsOrderBy?: string;
    resultsOrderAscending?: boolean;
    resultsLimitOffset?: number;
    resultsLimitCount?: number;
  }): ResultParameter;
  
  static createArray(data: any[]): ResultParameter[];
}

export default ResultParameter;