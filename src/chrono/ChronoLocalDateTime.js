/*
 * @copyright (c) 2016, Philipp Thuerwaechter & Pattrick Hueper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {requireNonNull} from '../assert';
import {MathUtil} from '../MathUtil';

import {LocalDate} from '../LocalDate';
import {Instant} from '../Instant';
import {ChronoUnit} from '../temporal/ChronoUnit';
import {ChronoField} from '../temporal/ChronoField';
import {Temporal} from '../temporal/Temporal';
import {TemporalQueries} from '../temporal/TemporalQueries';

/**
 * A date-time without a time-zone in an arbitrary chronology, intended
 * for advanced globalization use cases.
 * <p>
 * <b>Most applications should declare method signatures, fields and variables
 * as {@link LocalDateTime}, not this interface.</b>
 * <p>
 * A {@code ChronoLocalDateTime} is the abstract representation of a local date-time
 * where the {@code Chronology chronology}, or calendar system, is pluggable.
 * The date-time is defined in terms of fields expressed by {@link TemporalField},
 * where most common implementations are defined in {@link ChronoField}.
 * The chronology defines how the calendar system operates and the meaning of
 * the standard fields.
 *
 * <h4>When to use this interface</h4>
 * The design of the API encourages the use of {@code LocalDateTime} rather than this
 * interface, even in the case where the application needs to deal with multiple
 * calendar systems. The rationale for this is explored in detail in {@link ChronoLocalDate}.
 * <p>
 * Ensure that the discussion in {@code ChronoLocalDate} has been read and understood
 * before using this interface.
 *
 * <h3>Specification for implementors</h3>
 * This interface must be implemented with care to ensure other classes operate correctly.
 * All implementations that can be instantiated must be final, immutable and thread-safe.
 * Subclasses should be Serializable wherever possible.
 * <p>
 * In JDK 8, this is an interface with default methods.
 * Since there are no default methods in JDK 7, an abstract class is used.
 *
 * @param <D> the date type
 */
export class ChronoLocalDateTime extends Temporal {
        /* <D extends ChronoLocalDate>
        extends DefaultInterfaceTemporal
        implements Temporal, TemporalAdjuster, Comparable<ChronoLocalDateTime<?>> */

    //-----------------------------------------------------------------------
    /**
     * Gets the chronology of this date-time.
     * <p>
     * The {@code Chronology} represents the calendar system in use.
     * The era and other fields in {@link ChronoField} are defined by the chronology.
     *
     * @return the chronology, not null
     */
    chronology() {
        return this.toLocalDate().chronology();
    }

    /**
     *
     * @param {TemporalQuery} query
     * @returns {*}
     */
    query(query) {
        if (query === TemporalQueries.chronology()) {
            return this.chronology();
        } else if (query === TemporalQueries.precision()) {
            return ChronoUnit.NANOS;
        } else if (query === TemporalQueries.localDate()) {
            return LocalDate.ofEpochDay(this.toLocalDate().toEpochDay());
        } else if (query === TemporalQueries.localTime()) {
            return this.toLocalTime();
        } else if (query === TemporalQueries.zone() || query === TemporalQueries.zoneId() || query === TemporalQueries.offset()) {
            return null;
        }
        return super.query(query);
    }

    adjustInto(temporal) {
        return temporal
                .with(ChronoField.EPOCH_DAY, this.toLocalDate().toEpochDay())
                .with(ChronoField.NANO_OF_DAY, this.toLocalTime().toNanoOfDay());
    }

    //-----------------------------------------------------------------------
    /**
     * Converts this date-time to an {@code Instant}.
     * <p>
     * This combines this local date-time and the specified offset to form
     * an {@code Instant}.
     *
     * @param {ZoneOffset} offset  the offset to use for the conversion, not null
     * @return {Instant} an {@code Instant} representing the same instant, not null
     */
    toInstant(offset) {
        return Instant.ofEpochSecond(this.toEpochSecond(offset), this.toLocalTime().nano());
    }

    /**
     * Converts this date-time to the number of seconds from the epoch
     * of 1970-01-01T00:00:00Z.
     * <p>
     * This combines this local date-time and the specified offset to calculate the
     * epoch-second value, which is the number of elapsed seconds from 1970-01-01T00:00:00Z.
     * Instants on the time-line after the epoch are positive, earlier are negative.
     *
     * @param {ZoneOffset} offset  the offset to use for the conversion, not null
     * @return {number} the number of seconds from the epoch of 1970-01-01T00:00:00Z
     */
    toEpochSecond(offset) {
        requireNonNull(offset, 'offset');
        var epochDay = this.toLocalDate().toEpochDay();
        var secs = epochDay * 86400 + this.toLocalTime().toSecondOfDay();
        secs -= offset.totalSeconds();
        return MathUtil.safeToInt(secs);
    }

}
