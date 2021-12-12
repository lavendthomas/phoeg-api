import {IPointsQueryResults} from "../routes/points";

abstract class Filter {

    abstract filter(data: IPointsQueryResults): IPointsQueryResults;

}

export class NullFilter extends Filter {

    filter(data: IPointsQueryResults): IPointsQueryResults {
        return data;
    }
}