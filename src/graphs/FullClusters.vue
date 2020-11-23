<template>
    <div id="clusters"></div>
</template>

<script>
/* eslint-disable no-param-reassign */

import * as d3 from 'd3';

const drag = (simulation) => {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
};

export default {
    name: 'FullClusters',
    data() {
        return {
            nodes: [],
            links: [],
            force: null,
        };
    },
    computed: {
        loadedFriends() {
            return this.$store.state.loadedFriends;
        },
    },
    methods: {
        updateData() {
            this.nodes = this.$store.state.friends
                .filter((f) => f.friends && f.friends.length)
                .map((f) => ({ id: f.id, friends: f.friends, photo: f.photo_50 }));

            const { user } = this.$store.state;
            this.nodes.push({
                id: user.id,
                friends: this.$store.state.friends.map((f) => f.id),
                photo_50: user.photo_50,
            });

            this.links = [];

            const wrotePairs = [];
            this.nodes.forEach((n) => {
                if (n.friends) {
                    n.friends.forEach((ff) => {
                        if (this.nodes.some((nn) => nn.id === ff)) {
                            const pair = n.id < ff ? `${n.id}_${ff}` : `${ff}_${n.id}`;
                            if (!wrotePairs.includes(pair)) {
                                wrotePairs.push(pair);
                                this.links.push({
                                    source: n.id,
                                    target: ff,
                                });
                            }
                        }
                    });
                }
            });
        },
    },
    mounted() {

    },
    watch: {
        loadedFriends() {
            if (this.loadedFriends) {
                this.updateData();

                this.$nextTick(() => {
                    const element = document.getElementById('clusters');
                    const width = element.clientWidth;
                    const height = element.clientHeight;

                    // eslint-disable-next-line no-unused-vars
                    const svg = d3.select('#clusters').append('svg')
                        .attr('width', width)
                        .attr('height', height);

                    const g = svg.append('g');

                    const zoom = d3.zoom().on('zoom', (e) => {
                        g.attr('transform', e.transform);
                    });

                    this.force = d3.forceSimulation(this.nodes)
                        .force('charge', d3.forceManyBody().strength(-60))
                        .force('link', d3.forceLink(this.links).id((d) => d.id))
                        .force('center', d3.forceCenter(width / 2, height / 2));

                    const userId = this.$store.state.user.id;
                    const showLinks = this.links
                        .filter((l) => l.source.id === userId || l.target.id === userId);

                    const link = g.selectAll('.fc-link')
                        .data(showLinks)
                        .join('line')
                        .attr('class', 'fc-link');

                    const node = g.selectAll('.fc-node')
                        .data(this.nodes)
                        .join('circle')
                        .attr('class', 'fc-node')
                        .attr('r', 5)
                        .attr('fill', '#ffffff')
                        .call(drag(this.force));

                    const myNode = this.nodes.find((n) => n.id === userId);

                    svg
                        .call(zoom)
                        .call(
                            zoom.transform,
                            d3.zoomIdentity.translate(width / 2, height / 2)
                                .scale(0.4)
                                .translate(-myNode.x, -myNode.y),
                        );

                    this.force.on('tick', () => {
                        link
                            .attr('x1', (d) => d.source.x)
                            .attr('y1', (d) => d.source.y)
                            .attr('x2', (d) => d.target.x)
                            .attr('y2', (d) => d.target.y);

                        node
                            .attr('cx', (d) => d.x)
                            .attr('cy', (d) => d.y);
                    });
                });
            }
        },
    },
};
</script>

<style>
.fc-link {
    stroke: rgba(229, 183, 154, 0.2);
}

.fc-node fc-text {
    pointer-events: none;
    font: 10px sans-serif;
}
</style>
