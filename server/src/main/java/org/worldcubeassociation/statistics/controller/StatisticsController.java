package org.worldcubeassociation.statistics.controller;

import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.worldcubeassociation.statistics.dto.ControlItemDTO;
import org.worldcubeassociation.statistics.dto.StatisticsRequestDTO;
import org.worldcubeassociation.statistics.dto.StatisticsResponseDTO;

import java.io.IOException;
import java.util.List;
import javax.validation.Valid;

@RequestMapping("statistics")
@CrossOrigin(origins = "*", allowedHeaders = "*") // Enable this for testing
public interface StatisticsController {

    @PostMapping
    @ApiOperation(
            "Mostly for test. You can create a statistic from an SQL without the need to generate all the statistics."
                    + " On it's simplest form, you can get the content of a JSON in resources/statistics-request-list"
                    + " and use it as body.")
    StatisticsResponseDTO sqlToStatistics(@Valid @RequestBody StatisticsRequestDTO statisticsRequestDTO)
            throws IOException;

    @PostMapping("generate")
    void generateAll() throws IOException;

    @GetMapping("list")
    List<ControlItemDTO> list() throws IOException;

    @GetMapping("list/{pathId}")
    StatisticsResponseDTO getStatistic(@PathVariable String pathId) throws IOException;
}
