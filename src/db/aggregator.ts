import { IPointsQueryResults } from "../routes/points";

abstract class Aggregator {

    abstract aggregate(data: IPointsQueryResults): IPointsQueryResults;

}


export class NullAggregator extends Aggregator {

    aggregate(data: IPointsQueryResults): IPointsQueryResults {
        return data;
    }


}